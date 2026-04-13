import { useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, useTransform, useSpring, MotionValue } from 'framer-motion';
import type { Card } from '../../lib/types';

interface CardProps {
  card: Card;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  onDelete: () => void;
}

export default function KanbanCard({ card, mouseX, mouseY, onDelete }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showVideo, setShowVideo] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  // Proximity magnification effect
  const distance = useTransform([mouseX, mouseY], ([mx, my]: number[]) => {
    if (!cardRef.current) return 500;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;
    return Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
  });

  const proximityScale = useTransform(distance, [0, 120, 250, 400], [1.08, 1.04, 1.01, 1.0]);
  const springScale = useSpring(proximityScale, { stiffness: 300, damping: 25 });

  const rotation = card.rotation ?? 0;
  const date = new Date(card.created_at).toLocaleDateString([], { month: 'short', day: '2-digit' });

  const isCompleted = card.status === 'completed' && card.video_url;

  return (
    <>
      <motion.div
        ref={(node) => { setNodeRef(node); (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node; }}
        className="card"
        style={{ ...style, rotate: isDragging ? 0 : rotation, scale: springScale }}
        whileHover={{ rotate: 0, boxShadow: '0 12px 28px rgba(0,0,0,0.15)', zIndex: 10, borderColor: 'var(--accent)' }}
        whileDrag={{ rotate: 3, boxShadow: '0 30px 60px rgba(0,0,0,0.35)', scale: 1.05 }}
        {...attributes}
        {...listeners}
      >
        <div className="card-actions">
          <button className="btn-icon card-delete" onClick={(e) => { e.stopPropagation(); onDelete(); }}>✕</button>
        </div>

        <div className={`card-platform ${card.platform || 'draft'}`}>
          {card.platform || 'manual'}
        </div>

        <div className="card-prompt">{card.prompt || 'Sem prompt'}</div>

        {isCompleted ? (
          <div className="card-video-btn" onClick={(e) => { e.stopPropagation(); setShowVideo(true); }}>
            ▶ Ver Vídeo
          </div>
        ) : card.status === 'failed' ? (
          <div className="card-video-btn failed">❌ Falhou</div>
        ) : card.status === 'processing' ? (
          <div className="card-video-btn processing">⏳ Gerando...</div>
        ) : null}

        <div className="card-meta">
          <span>{card.model_name || card.aspect_ratio || ''}</span>
          <span>{date}</span>
        </div>
      </motion.div>

      {/* Video Modal */}
      {showVideo && card.video_url && (
        <div className="modal-overlay" onClick={() => setShowVideo(false)}>
          <div className="modal-box video-modal-content" onClick={e => e.stopPropagation()}>
            <video src={card.video_url} controls autoPlay style={{ width: '100%', borderRadius: 8, background: '#000' }} />
            <div className="video-modal-info">
              <p><strong>Prompt:</strong> {card.prompt}</p>
              {card.model_name && <p><strong>Modelo:</strong> {card.model_name}</p>}
              {card.aspect_ratio && <p><strong>Ratio:</strong> {card.aspect_ratio}</p>}
              {card.duration && <p><strong>Duração:</strong> {card.duration}</p>}
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowVideo(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
