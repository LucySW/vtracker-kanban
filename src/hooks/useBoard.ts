import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Column, Card } from '../lib/types';

export function useBoard(projectId: string | null) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBoard = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);

    const [colRes, cardRes] = await Promise.all([
      supabase.from('columns').select('*').eq('project_id', projectId).order('position'),
      supabase.from('cards').select('*').eq('project_id', projectId).order('position'),
    ]);

    if (colRes.data) setColumns(colRes.data);
    if (cardRes.data) {
      // Add random rotation to cards that don't have one
      const cardsWithRotation = cardRes.data.map(card => ({
        ...card,
        rotation: card.rotation ?? (Math.random() > 0.5 ? 1 : -1) * (5 + Math.random() * 10),
      }));
      setCards(cardsWithRotation);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  // Realtime subscription
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase.channel(`board-${projectId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cards', filter: `project_id=eq.${projectId}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newCard = { ...payload.new as Card, rotation: (Math.random() > 0.5 ? 1 : -1) * (5 + Math.random() * 10) };
          setCards(prev => [...prev, newCard]);
        } else if (payload.eventType === 'UPDATE') {
          setCards(prev => prev.map(c => c.id === (payload.new as Card).id ? { ...payload.new as Card, rotation: c.rotation } : c));
        } else if (payload.eventType === 'DELETE') {
          setCards(prev => prev.filter(c => c.id !== (payload.old as Card).id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'columns', filter: `project_id=eq.${projectId}` }, () => {
        fetchBoard();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [projectId, fetchBoard]);

  const moveCard = async (cardId: string, newColumnId: string, newPosition: number) => {
    // Optimistic update
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, column_id: newColumnId, position: newPosition } : c));

    await supabase.from('cards').update({ column_id: newColumnId, position: newPosition }).eq('id', cardId);
  };

  const addCard = async (columnId: string, cardData: Partial<Card>) => {
    const maxPos = cards.filter(c => c.column_id === columnId).reduce((max, c) => Math.max(max, c.position), -1);

    const { error } = await supabase.from('cards').insert({
      ...cardData,
      column_id: columnId,
      project_id: projectId,
      position: maxPos + 1,
      status: cardData.status || 'draft',
    });

    if (!error) await fetchBoard();
  };

  const updateCard = async (cardId: string, updates: Partial<Card>) => {
    await supabase.from('cards').update(updates).eq('id', cardId);
  };

  const deleteCard = async (cardId: string) => {
    await supabase.from('cards').delete().eq('id', cardId);
    setCards(prev => prev.filter(c => c.id !== cardId));
  };

  const addColumn = async (name: string) => {
    const maxPos = columns.reduce((max, c) => Math.max(max, c.position), -1);
    await supabase.from('columns').insert({ project_id: projectId, name, position: maxPos + 1 });
    await fetchBoard();
  };

  const deleteColumn = async (columnId: string) => {
    await supabase.from('columns').delete().eq('id', columnId);
    await fetchBoard();
  };

  const getColumnCards = (columnId: string) => cards.filter(c => c.column_id === columnId).sort((a, b) => a.position - b.position);

  return { columns, cards, loading, moveCard, addCard, updateCard, deleteCard, addColumn, deleteColumn, getColumnCards, refetch: fetchBoard };
}
