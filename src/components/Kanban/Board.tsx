import { useState, useRef, useCallback } from 'react';
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useMotionValue } from 'framer-motion';
import { useBoard } from '../../hooks/useBoard';
import TopBar from '../Layout/TopBar';
import KanbanColumn from './Column';
import KanbanCard from './Card';
import type { Project, Card } from '../../lib/types';

interface BoardProps {
  project: Project;
  onBack: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  userEmail?: string;
  userId: string;
  onSignOut: () => void;
}

export default function Board({ project, onBack, theme, onToggleTheme, userEmail, userId, onSignOut }: BoardProps) {
  const { columns, loading, moveCard, addCard, deleteCard, addColumn, deleteColumn, getColumnCards } = useBoard(project.id);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [showAddCol, setShowAddCol] = useState(false);
  const [newColName, setNewColName] = useState('');
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const boardRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  }, [mouseX, mouseY]);

  const handleDragStart = (event: DragStartEvent) => {
    const card = columns.flatMap(col => getColumnCards(col.id)).find(c => c.id === event.active.id);
    if (card) setActiveCard(card);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const cardId = active.id as string;
    let targetColumnId = over.id as string;

    // Check if dropped over a card → get that card's column
    const allCards = columns.flatMap(col => getColumnCards(col.id));
    const overCard = allCards.find(c => c.id === targetColumnId);
    if (overCard) {
      targetColumnId = overCard.column_id;
    }

    // Check if it's actually a column
    const isColumn = columns.some(c => c.id === targetColumnId);
    if (!isColumn) return;

    const targetCards = getColumnCards(targetColumnId);
    const newPos = overCard ? overCard.position : targetCards.length;

    moveCard(cardId, targetColumnId, newPos);
  };

  const handleAddColumn = () => {
    if (!newColName.trim()) return;
    addColumn(newColName.trim());
    setNewColName('');
    setShowAddCol(false);
  };

  const handleAddCard = (columnId: string) => {
    const prompt = window.prompt('Prompt / descrição do card:');
    if (!prompt) return;
    addCard(columnId, { prompt, user_id: userId, status: 'draft', platform: 'manual' });
  };

  if (loading) return <div className="board-page"><TopBar title={project.name} onBack={onBack} theme={theme} onToggleTheme={onToggleTheme} userEmail={userEmail} onSignOut={onSignOut} /><div className="empty-state"><p>Carregando board...</p></div></div>;

  return (
    <div className="board-page">
      <TopBar title={project.name} onBack={onBack} theme={theme} onToggleTheme={onToggleTheme} userEmail={userEmail} onSignOut={onSignOut} />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="board" ref={boardRef} onMouseMove={handleMouseMove}>
          {columns.map(column => {
            const colCards = getColumnCards(column.id);
            return (
              <KanbanColumn
                key={column.id}
                column={column}
                cardCount={colCards.length}
                onDelete={() => deleteColumn(column.id)}
                onAddCard={() => handleAddCard(column.id)}
              >
                <SortableContext items={colCards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                  {colCards.map(card => (
                    <KanbanCard
                      key={card.id}
                      card={card}
                      mouseX={mouseX}
                      mouseY={mouseY}
                      onDelete={() => deleteCard(card.id)}
                    />
                  ))}
                </SortableContext>
              </KanbanColumn>
            );
          })}

          {showAddCol ? (
            <div style={{ minWidth: 280 }}>
              <input className="input" value={newColName} onChange={e => setNewColName(e.target.value)} placeholder="Nome da coluna" autoFocus onKeyDown={e => e.key === 'Enter' && handleAddColumn()} />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn btn-primary" onClick={handleAddColumn}>Criar</button>
                <button className="btn btn-ghost" onClick={() => setShowAddCol(false)}>Cancelar</button>
              </div>
            </div>
          ) : (
            <button className="add-column-btn" onClick={() => setShowAddCol(true)}>+ Adicionar Coluna</button>
          )}
        </div>

        <DragOverlay>
          {activeCard && (
            <div className="card" style={{ transform: 'rotate(3deg)', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', opacity: 0.9 }}>
              <div className={`card-platform ${activeCard.platform || 'draft'}`}>{activeCard.platform || 'manual'}</div>
              <div className="card-prompt">{activeCard.prompt || 'Sem prompt'}</div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
