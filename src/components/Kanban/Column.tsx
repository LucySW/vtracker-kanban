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
    <div className="flex-none w-72 h-full flex flex-col gap-6 group/col">
      {/* Column Header — matching ref 1: "Cena 1 - Abertura  3 SHOTS" */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg font-bold text-slate-200">{column.name}</h2>
        <div className="flex items-center gap-2">
          <span className="bg-surface-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border border-outline-variant/10">
            {cardCount} {cardCount === 1 ? 'SHOT' : 'SHOTS'}
          </span>
          <button
            onClick={onDelete}
            className="p-1 text-zinc-600 hover:text-error rounded-full hover:bg-error/10 transition-all opacity-0 group-hover/col:opacity-100"
            title="Excluir coluna"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      </div>

      {/* Script Text Area — matching ref 1: colored left bar + quote block */}
      {column.script_text && (
        <div className="relative pl-4">
          {/* Colored left accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-to-b from-primary via-tertiary to-primary/20" />
          <p className="text-sm text-slate-400 leading-relaxed italic">
            "{column.script_text}"
          </p>
        </div>
      )}

      {/* Cards area — scene-column with radial gradient bg */}
      <div
        ref={setNodeRef}
        className={`flex-1 scene-column rounded-lg relative p-4 space-y-4 transition-colors duration-200 ${
          isOver ? 'bg-primary/5 ring-1 ring-primary/20' : ''
        }`}
      >
        {children}

        {/* Append Scene button — matching ref exactly */}
        <button
          onClick={onAddCard}
          className="w-full py-4 border-2 border-dashed border-outline-variant/20 rounded-lg flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:bg-slate-800/20 transition-colors group/add"
        >
          <span className="material-symbols-outlined group-hover/add:text-primary transition-colors">add_circle</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Adicionar Shot</span>
        </button>
      </div>
    </div>
  );
}
