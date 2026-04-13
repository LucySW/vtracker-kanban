import { useState } from 'react';
import { DndContext, closestCorners, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useMotionValue } from 'framer-motion';
import type { Project } from '../../lib/types';
import { useBoard } from '../../hooks/useBoard';
import KanbanColumn from './Column';
import KanbanCard from './Card';
import { TopBar } from '../Layout/TopBar';

interface BoardProps {
  project: Project;
  onBack: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  userEmail?: string;
  userId: string;
  onSignOut: () => void;
}

export default function Board({ project, onBack, userEmail, userId, onSignOut }: BoardProps) {
  const { columns, loading, moveCard, addCard, deleteCard, addColumn, deleteColumn, getColumnCards } = useBoard(project.id);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const cardId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    const targetColumn = columns.find(c => c.id === overId);
    if (targetColumn) {
      const columnCards = getColumnCards(targetColumn.id);
      moveCard(cardId, targetColumn.id, columnCards.length);
      return;
    }

    // Find which column the target card belongs to
    const allCards = columns.flatMap(col => getColumnCards(col.id));
    const overCard = allCards.find(c => c.id === overId);
    if (overCard) {
      moveCard(cardId, overCard.column_id, overCard.position);
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return;
    await addColumn(newColumnName);
    setNewColumnName('');
    setShowAddColumn(false);
  };

  const handleAddCard = async (columnId: string) => {
    await addCard(columnId, {
      user_id: userId,
      prompt: 'Novo clipe de cena',
      status: 'draft',
    });
  };

  const totalCards = columns.reduce((sum, col) => sum + getColumnCards(col.id).length, 0);

  return (
    <div
      className="flex flex-col h-screen w-full bg-background overflow-hidden"
      onMouseMove={(e) => { mouseX.set(e.clientX); mouseY.set(e.clientY); }}
    >
      {/* Top Navigation */}
      <TopBar
        userEmail={userEmail}
        onSignOut={onSignOut}
        onBack={onBack}
        title={project.name}
      />

      {/* Sidebar (Workspace mode) */}
      <aside className="fixed left-0 top-[57px] h-[calc(100vh-57px)] w-64 z-40 bg-[#000]/80 backdrop-blur-2xl hidden md:flex flex-col py-6 px-4 gap-4 text-sm">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container-high border border-outline-variant/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">movie_filter</span>
          </div>
          <div>
            <p className="text-white font-black text-lg leading-tight truncate max-w-[140px]">{project.name}</p>
            <p className="text-zinc-500 text-xs">{project.description || 'Sem descrição'}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="px-2 space-y-3 mb-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500">Total de Cenas</span>
            <span className="text-zinc-300 font-medium">{columns.length}</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-tertiary h-full transition-all duration-500" style={{ width: `${Math.min(100, columns.length * 15)}%` }} />
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500">Total de Cards</span>
            <span className="text-zinc-300 font-medium">{totalCards}</span>
          </div>
        </div>

        <div className="border-t border-outline-variant/10 pt-4">
          <div className="flex items-center bg-surface-container-high rounded-xl px-3 py-2 gap-2 text-xs border border-outline-variant/10">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            <span className="text-on-surface-variant font-medium">Sincronização em Tempo Real</span>
          </div>
        </div>

        <button
          onClick={() => setShowAddColumn(true)}
          className="mt-4 bg-primary text-on-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined">add</span>
          Nova Cena
        </button>

        <div className="mt-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 transition-all w-full"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Voltar aos Projetos</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="md:pl-64 flex-1 flex flex-col overflow-hidden">
        {/* Dashboard Header */}
        <div className="px-8 py-6 flex items-end justify-between shrink-0">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-on-surface">Storyboard</h1>
            <p className="text-on-surface-variant text-sm mt-1">Organizando sequências cinematográficas</p>
          </div>
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-on-surface-variant">
              <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-sm font-medium">Carregando cenas...</span>
            </div>
          </div>
        ) : (
          <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            <div className="flex-1 px-8 pb-8 flex gap-6 overflow-x-auto">
              {columns.map(column => {
                const columnCards = getColumnCards(column.id);
                return (
                  <SortableContext key={column.id} items={columnCards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    <KanbanColumn
                      column={column}
                      cardCount={columnCards.length}
                      onDelete={() => { if (confirm('Tem certeza que deseja excluir esta cena?')) deleteColumn(column.id); }}
                      onAddCard={() => handleAddCard(column.id)}
                    >
                      {columnCards.map(card => (
                        <KanbanCard
                          key={card.id}
                          card={card}
                          mouseX={mouseX}
                          mouseY={mouseY}
                          onDelete={() => deleteCard(card.id)}
                        />
                      ))}
                    </KanbanColumn>
                  </SortableContext>
                );
              })}

              {/* Add column button */}
              {showAddColumn ? (
                <div className="flex-none w-72 p-4 space-y-3">
                  <input
                    value={newColumnName}
                    onChange={e => setNewColumnName(e.target.value)}
                    placeholder="Nome da cena..."
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleAddColumn()}
                    className="w-full h-12 bg-surface-container-lowest text-white px-5 rounded-xl border-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-zinc-700"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleAddColumn} className="flex-1 bg-primary text-on-primary py-2 rounded-xl font-semibold text-sm active:scale-95 transition-transform">
                      Adicionar
                    </button>
                    <button onClick={() => { setShowAddColumn(false); setNewColumnName(''); }} className="flex-1 bg-surface-container-high text-on-surface-variant py-2 rounded-xl text-sm hover:bg-surface-container-highest transition-colors">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddColumn(true)}
                  className="flex-none w-72 py-4 border-2 border-dashed border-outline-variant/20 rounded-2xl flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:bg-surface-container-low/50 hover:border-primary/30 transition-colors group h-fit"
                >
                  <span className="material-symbols-outlined group-hover:text-primary transition-colors">add_circle</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Adicionar Coluna de Cena</span>
                </button>
              )}
            </div>
          </DndContext>
        )}
      </main>
    </div>
  );
}