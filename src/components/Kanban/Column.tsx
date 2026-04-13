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
    <div className={`column ${isOver ? 'drag-over' : ''}`} style={column.color ? { borderTopColor: column.color, borderTopWidth: 3 } : undefined}>
      <div className="column-header">
        <div className="column-header-left">
          <h3>{column.name}</h3>
          <span className="column-count">{cardCount}</span>
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          <button className="btn-icon" onClick={onAddCard} title="Adicionar card" style={{ fontSize: '0.9rem' }}>+</button>
          <button className="btn-icon card-delete" onClick={onDelete} title="Excluir coluna" style={{ fontSize: '0.75rem' }}>🗑</button>
        </div>
      </div>

      {column.script_text && (
        <div className="column-script">📝 {column.script_text}</div>
      )}

      <div className="column-body" ref={setNodeRef}>
        {children}
      </div>
    </div>
  );
}
