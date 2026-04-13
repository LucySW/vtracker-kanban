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
      prompt: 'New scene clip',
      status: 'draft',
    });
  };

  return (
    <div
      className="flex flex-col h-screen w-full bg-background overflow-hidden"
      onMouseMove={(e) => { mouseX.set(e.clientX); mouseY.set(e.clientY); }}
    >
      {/* Top Navigation */}
      <TopBar
        userEmail={userEmail}
        onSignOut={onSignOut}
        activeTab="studio"
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
            <p className="text-zinc-500 text-xs">{project.description || 'No description'}</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary border-r-2 border-primary transition-all">
            <span className="material-symbols-outlined">video_library</span>
            <span>Media Pool</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 transition-all">
            <span className="material-symbols-outlined">auto_fix_high</span>
            <span>Effects</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 transition-all">
            <span className="material-symbols-outlined">movie_edit</span>
            <span>Transitions</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 transition-all">
            <span className="material-symbols-outlined">graphic_eq</span>
            <span>Audio</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 transition-all">
            <span className="material-symbols-outlined">info</span>
            <span>Inspector</span>
          </button>
        </nav>

        <button
          onClick={() => setShowAddColumn(true)}
          className="mt-4 bg-primary text-on-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined">add</span>
          New Scene
        </button>

        <div className="mt-auto border-t border-outline-variant/20 pt-4 flex flex-col gap-1">
          <button className="flex items-center gap-3 px-4 py-2 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 transition-all">
            <span className="material-symbols-outlined">help_outline</span>
            <span>Help</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="md:pl-64 flex-1 flex flex-col overflow-hidden">
        {/* Dashboard Header */}
        <div className="px-8 py-6 flex items-end justify-between shrink-0">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-on-surface">Storyboard Board</h1>
            <p className="text-on-surface-variant text-sm mt-1">Arranging cinematic sequences</p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex items-center bg-surface-container-high rounded-full px-4 py-2 gap-2 text-sm border border-outline-variant/10">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
              <span className="text-on-surface-variant font-medium uppercase tracking-wider text-[10px]">Real-time Sync</span>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-on-surface-variant">
              <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading scenes...</span>
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
                      onDelete={() => deleteColumn(column.id)}
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
                    placeholder="Scene name..."
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleAddColumn()}
                    className="w-full h-12 bg-surface-container-lowest text-white px-5 rounded-xl border-none focus:ring-1 focus:ring-primary/40 transition-all placeholder:text-zinc-700"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleAddColumn} className="flex-1 bg-primary text-on-primary py-2 rounded-xl font-semibold text-sm active:scale-95 transition-transform">
                      Add
                    </button>
                    <button onClick={() => { setShowAddColumn(false); setNewColumnName(''); }} className="flex-1 bg-surface-container-high text-on-surface-variant py-2 rounded-xl text-sm hover:bg-surface-container-highest transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddColumn(true)}
                  className="flex-none w-72 py-4 border-2 border-dashed border-outline-variant/20 rounded-2xl flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:bg-surface-container-low/50 hover:border-primary/30 transition-colors group h-fit"
                >
                  <span className="material-symbols-outlined group-hover:text-primary transition-colors">add_circle</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Add Scene Column</span>
                </button>
              )}
            </div>
          </DndContext>
        )}
      </main>

      {/* ===== Floating UI Panels ===== */}
      <div className="fixed right-8 bottom-8 flex flex-col gap-4 z-50">
        <button className="w-14 h-14 bg-primary text-on-primary rounded-full shadow-glow-primary flex items-center justify-center hover:scale-110 active:scale-95 transition-transform group">
          <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform duration-500">auto_fix_high</span>
        </button>
        <div className="bg-surface-container-highest/80 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-4 w-64 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-tertiary">analytics</span>
            <span className="text-sm font-bold">Scene Timeline Stats</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-on-surface-variant uppercase tracking-tighter">Total Scenes</span>
              <span className="text-zinc-200">{columns.length}</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-tertiary h-full transition-all duration-500" style={{ width: `${Math.min(100, columns.length * 15)}%` }} />
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-on-surface-variant uppercase tracking-tighter">Total Cards</span>
              <span className="text-zinc-200">{columns.reduce((sum, col) => sum + getColumnCards(col.id).length, 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}