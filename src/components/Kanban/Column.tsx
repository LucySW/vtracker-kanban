import { useDroppable } from '@dnd-kit/core';
import type { Column } from '../../lib/types';

interface ColumnProps {
  column: Column;
  cardCount: number;
  children: React.ReactNode;
  onDelete: () => void;
  onAddCard: () => void;
}

export default function KanbanColumn({ column, cardCount, children, onDelete, onAddCard }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex-none w-72 h-full flex flex-col gap-6">
      {/* Column Header */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg font-bold text-zinc-200">{column.name}</h2>
        <div className="flex items-center gap-2">
          <span className="bg-surface-container px-3 py-1 rounded-full text-xs text-on-surface-variant border border-outline-variant/10">
            {cardCount}
          </span>
          <button
            onClick={onDelete}
            className="p-1 text-zinc-600 hover:text-error rounded-full hover:bg-error/10 transition-all opacity-0 group-hover:opacity-100"
            title="Delete column"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      </div>

      {/* Script Text */}
      {column.script_text && (
        <div className="px-3 py-2 text-xs text-on-surface-variant/70 italic leading-relaxed bg-surface-container/50 rounded-xl border border-outline-variant/10 max-h-20 overflow-y-auto">
          📝 {column.script_text}
        </div>
      )}

      {/* Cards area */}
      <div
        ref={setNodeRef}
        className={`flex-1 scene-column rounded-2xl relative p-4 space-y-4 transition-colors duration-200 ${
          isOver ? 'bg-primary/5 ring-1 ring-primary/20' : ''
        }`}
      >
        {children}

        {/* Append Scene button */}
        <button
          onClick={onAddCard}
          className="w-full py-4 border-2 border-dashed border-outline-variant/20 rounded-xl flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:bg-surface-container-low/50 hover:border-primary/30 transition-colors group"
        >
          <span className="material-symbols-outlined group-hover:text-primary transition-colors">add_circle</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Append Scene</span>
        </button>
      </div>
    </div>
  );
}
