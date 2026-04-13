import { useState } from 'react';
import { DndContext, closestCorners, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useMotionValue } from 'framer-motion';
import type { Project } from '../../lib/types';
import { useBoard } from '../../hooks/useBoard';
import KanbanColumn from './Column';
import KanbanCard from './Card';

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

    const targetColumn = columns.find(c => c.id === overId);
    if (targetColumn) {
      const columnCards = getColumnCards(targetColumn.id);
      moveCard(cardId, targetColumn.id, columnCards.length);
      return;
    }

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
      className="flex h-screen w-full bg-background overflow-hidden"
      onMouseMove={(e) => { mouseX.set(e.clientX); mouseY.set(e.clientY); }}
    >
      {/* ===== Side Nav (matching VTracker Scene Workspace ref) ===== */}
      <aside className="hidden md:flex flex-col h-full w-64 bg-slate-950/80 backdrop-blur-2xl py-6 px-4 gap-4 text-sm z-50 shadow-[20px_0_80px_rgba(0,0,0,0.4)]">
        {/* Project info */}
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container-high border border-outline-variant/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">movie_filter</span>
          </div>
          <div>
            <p className="text-slate-50 font-black text-lg leading-tight truncate max-w-[140px]">{project.name}</p>
            <p className="text-slate-500 text-xs">{project.description || 'Sem descrição'}</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 flex flex-col gap-1">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-500/10 text-violet-300 border-r-2 border-violet-500 transition-all duration-500">
            <span className="material-symbols-outlined">video_library</span>
            <span>Banco de Mídia</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition-all">
            <span className="material-symbols-outlined">auto_fix_high</span>
            <span>Efeitos</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition-all">
            <span className="material-symbols-outlined">movie_edit</span>
            <span>Transições</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition-all">
            <span className="material-symbols-outlined">graphic_eq</span>
            <span>Áudio</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition-all">
            <span className="material-symbols-outlined">info</span>
            <span>Inspetor</span>
          </button>
        </nav>

        {/* New Scene button */}
        <button
          onClick={() => setShowAddColumn(true)}
          className="mt-4 bg-primary text-on-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined">add</span>
          Nova Cena
        </button>

        {/* Bottom actions */}
        <div className="mt-auto border-t border-outline-variant/20 pt-4 flex flex-col gap-1">
          {userEmail && (
            <div className="px-4 py-2">
              <p className="text-xs text-slate-500 truncate">{userEmail}</p>
            </div>
          )}
          <button
            onClick={onBack}
            className="flex items-center gap-3 px-4 py-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Voltar</span>
          </button>
          <button
            onClick={onSignOut}
            className="flex items-center gap-3 px-4 py-2 rounded-xl text-slate-500 hover:text-error hover:bg-error/10 transition-all"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* ===== Main Area ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TopNavBar (matching ref 1) */}
        <header className="fixed top-0 right-0 left-0 md:left-64 z-50 bg-slate-950/60 backdrop-blur-xl flex justify-between items-center px-8 h-16 shadow-[0_40px_60px_-15px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold tracking-tighter text-slate-50">Kinetic Studio</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex items-center bg-slate-900/50 rounded-full px-4 py-1.5 gap-2 hover:bg-slate-800/50 transition-all duration-300 hidden sm:flex">
              <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-sm w-48 text-slate-200 placeholder:text-slate-600" placeholder="Buscar cenas..." type="text" />
            </div>
            <button className="bg-primary text-on-primary px-6 py-1.5 rounded-full text-sm font-semibold active:scale-90 transition-transform">
              Exportar
            </button>
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant bg-surface-container-high flex items-center justify-center text-sm font-bold text-on-surface">
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        {/* ===== Dashboard Header (matching ref 1) ===== */}
        <div className="pt-16">
          <div className="px-8 py-6 flex items-end justify-between">
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm mb-2">
                <button onClick={onBack} className="text-primary font-bold uppercase tracking-wider text-xs hover:text-primary/80 transition-colors">
                  PRODUCTION BOARD
                </button>
                <span className="text-slate-600">›</span>
                <span className="text-slate-400 text-xs">{project.name}</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-on-surface">Kinetic Editor</h1>
              <p className="text-on-surface-variant text-sm mt-1">Organizando sequências cinematográficas</p>
            </div>
            <div className="flex gap-3 items-center">
              {/* Collaboration avatars */}
              <div className="flex -space-x-2">
                {['bg-violet-600', 'bg-cyan-600', 'bg-pink-600'].map((bg, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-background flex items-center justify-center text-[10px] font-bold text-white`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-background flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                  +{Math.max(0, totalCards)}
                </div>
              </div>
              {/* Realtime badge */}
              <div className="flex items-center bg-surface-container-high rounded-full px-4 py-2 gap-2 text-sm border border-outline-variant/10">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                <span className="text-on-surface-variant font-medium uppercase tracking-wider text-[10px]">Sincronização em Tempo Real</span>
              </div>
              {/* Export Board button */}
              <button className="flex items-center gap-2 bg-surface-container-high text-on-surface-variant px-5 py-2 rounded-full text-sm font-medium border border-outline-variant/10 hover:bg-surface-container-highest transition-colors">
                <span className="material-symbols-outlined text-sm">ios_share</span>
                Exportar Board
              </button>
            </div>
          </div>
        </div>

        {/* ===== Kanban Board ===== */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-on-surface-variant">
              <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-sm font-medium">Carregando cenas...</span>
            </div>
          </div>
        ) : (
          <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            <div className="flex-1 px-8 pb-8 flex gap-6 overflow-x-auto custom-scroll">
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
                      {columnCards.map((card, idx) => (
                        <KanbanCard
                          key={card.id}
                          card={card}
                          cardIndex={idx}
                          mouseX={mouseX}
                          mouseY={mouseY}
                          onDelete={() => deleteCard(card.id)}
                        />
                      ))}
                    </KanbanColumn>
                  </SortableContext>
                );
              })}

              {/* Add column */}
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
                  className="flex-none w-72 py-4 border-2 border-dashed border-outline-variant/20 rounded-lg flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:bg-slate-800/20 transition-colors group h-fit"
                >
                  <span className="material-symbols-outlined group-hover:text-primary transition-colors">add_circle</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Adicionar Cena</span>
                </button>
              )}
            </div>
          </DndContext>
        )}
      </div>

      {/* ===== Floating UI Panels (matching ref) ===== */}
      <div className="fixed right-8 bottom-8 flex flex-col gap-4 z-50">
        {/* Magic wand button */}
        <button className="w-14 h-14 bg-primary text-on-primary rounded-full shadow-[0_20px_40px_-5px_rgba(205,189,255,0.3)] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform group">
          <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform duration-500">auto_fix_high</span>
        </button>
        {/* Stats panel */}
        <div className="bg-surface-container-highest/80 backdrop-blur-xl border border-outline-variant/30 rounded-2xl p-4 w-64 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-tertiary">analytics</span>
            <span className="text-sm font-bold">Estatísticas da Timeline</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-on-surface-variant uppercase tracking-tighter">Total de Cenas</span>
              <span className="text-slate-200">{columns.length}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-tertiary h-full transition-all duration-500" style={{ width: `${Math.min(100, columns.length * 15)}%` }} />
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-on-surface-variant uppercase tracking-tighter">Total de Cards</span>
              <span className="text-slate-200">{totalCards}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}