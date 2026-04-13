import { useRef, useState, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, useTransform, useSpring, MotionValue } from 'framer-motion';
import type { Card } from '../../lib/types';

interface CardProps {
  card: Card;
  cardIndex: number;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  onDelete: () => void;
}

const platformColors: Record<string, { text: string; accent: string }> = {
  kling: { text: 'text-cyan-300', accent: 'bg-cyan-500' },
  'runway': { text: 'text-violet-300', accent: 'bg-violet-500' },
  'wavespeed': { text: 'text-indigo-300', accent: 'bg-indigo-500' },
  'luma': { text: 'text-blue-300', accent: 'bg-blue-500' },
  'pika': { text: 'text-pink-300', accent: 'bg-pink-500' },
  draft: { text: 'text-zinc-400', accent: 'bg-zinc-600' },
  manual: { text: 'text-zinc-400', accent: 'bg-zinc-600' },
};

/**
 * Stagger patterns matching ref 2:
 * - Cards alternate between left-aligned, right-aligned, centered
 * - Different widths (w-full, w-[90%], w-[95%])
 * - Different rotation angles
 */
const staggerPatterns = [
  { width: 'w-full', align: '', rotation: -6 },
  { width: 'w-[90%]', align: 'mx-auto', rotation: 8 },
  { width: 'w-full', align: '', rotation: 5 },
  { width: 'w-[95%]', align: 'ml-auto', rotation: -12 },
  { width: 'w-[90%]', align: '', rotation: 10 },
  { width: 'w-[95%]', align: 'mx-auto', rotation: -5 },
  { width: 'w-full', align: 'ml-auto', rotation: 7 },
  { width: 'w-[90%]', align: '', rotation: -8 },
];

export default function KanbanCard({ card, cardIndex, mouseX, mouseY, onDelete }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showVideo, setShowVideo] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });

  // Get the stagger pattern for this card index
  const pattern = useMemo(() => staggerPatterns[cardIndex % staggerPatterns.length], [cardIndex]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  // Proximity magnification effect — cards scale up as mouse approaches
  const distance = useTransform([mouseX, mouseY], ([mx, my]: number[]) => {
    if (!cardRef.current) return 500;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.x + rect.width / 2;
    const cy = rect.y + rect.height / 2;
    return Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
  });

  const proximityScale = useTransform(distance, [0, 120, 250, 400], [1.1, 1.05, 1.01, 1.0]);
  const springScale = useSpring(proximityScale, { stiffness: 300, damping: 25 });

  const isCompleted = card.status === 'completed' && card.video_url;
  const platform = card.platform || 'draft';
  const colors = platformColors[platform.toLowerCase()] || platformColors.draft;

  return (
    <>
      <motion.div
        ref={(node) => { setNodeRef(node); (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node; }}
        className={`kinetic-card relative bg-surface-variant/60 backdrop-blur-md rounded-lg p-3 shadow-xl border border-outline-variant/20 transition-all duration-500 cursor-grab active:cursor-grabbing ${pattern.width} ${pattern.align}`}
        style={{
          ...style,
          rotate: isDragging ? 0 : pattern.rotation,
          scale: springScale,
        }}
        whileHover={{
          rotate: 0,
          scale: 1.1,
          boxShadow: '0 12px 28px rgba(0,0,0,0.3)',
          zIndex: 50,
          borderColor: 'rgba(189,157,255,0.3)',
        }}
        whileDrag={{
          rotate: 3,
          boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
          scale: 1.05,
        }}
        {...attributes}
        {...listeners}
      >
        {/* Thumbnail Area */}
        <div className="aspect-video rounded-sm overflow-hidden mb-3 bg-slate-800 flex items-center justify-center relative">
          {card.thumbnail_url ? (
            <img src={card.thumbnail_url} alt="" className="w-full h-full object-cover" />
          ) : isCompleted ? (
            <button
              onClick={(e) => { e.stopPropagation(); setShowVideo(true); }}
              className="flex items-center justify-center gap-2 text-primary hover:scale-110 transition-transform"
            >
              <span className="material-symbols-outlined text-3xl">play_circle</span>
            </button>
          ) : card.status === 'processing' ? (
            <div className="flex flex-col items-center gap-2 text-on-surface-variant">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Gerando...</span>
            </div>
          ) : card.status === 'failed' ? (
            <div className="flex flex-col items-center gap-1 text-error">
              <span className="material-symbols-outlined text-2xl">error</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Falhou</span>
            </div>
          ) : (
            <span className="material-symbols-outlined text-slate-600 text-4xl">movie</span>
          )}
        </div>

        {/* Platform + Duration (matching ref 1: "✦ RUNWAY GEN-3  00:04.5") */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${colors.accent}`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${colors.text}`}>
              {platform}
            </span>
          </div>
          {card.duration && (
            <span className="text-[10px] text-on-surface-variant font-mono">{card.duration}</span>
          )}
        </div>

        {/* Prompt text */}
        <p className="text-xs text-slate-300 font-medium leading-tight line-clamp-2">
          {card.prompt || 'Sem prompt'}
        </p>

        {/* Footer row — aspect ratio + more menu */}
        <div className="mt-3 pt-2 border-t border-outline-variant/10 flex justify-between items-center">
          {card.aspect_ratio && (
            <span className="bg-secondary-container/30 text-secondary px-2 py-0.5 rounded text-[10px]">
              {card.aspect_ratio}
            </span>
          )}
          {card.model_name && (
            <span className="text-[10px] text-on-surface-variant">{card.model_name}</span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="ml-auto text-on-surface-variant hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined text-xs">more_horiz</span>
          </button>
        </div>
      </motion.div>

      {/* Video Modal */}
      {showVideo && card.video_url && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowVideo(false)}>
          <div className="w-full max-w-3xl glass-effect rounded-2xl ghost-border shadow-deep p-6 relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <video src={card.video_url} controls autoPlay className="w-full rounded-xl bg-black max-h-[60vh]" />
            <div className="mt-4 space-y-1">
              <p className="text-sm text-on-surface-variant"><strong className="text-on-surface">Prompt:</strong> {card.prompt}</p>
              {card.model_name && <p className="text-sm text-on-surface-variant"><strong className="text-on-surface">Modelo:</strong> {card.model_name}</p>}
              {card.aspect_ratio && <p className="text-sm text-on-surface-variant"><strong className="text-on-surface">Proporção:</strong> {card.aspect_ratio}</p>}
              {card.duration && <p className="text-sm text-on-surface-variant"><strong className="text-on-surface">Duração:</strong> {card.duration}</p>}
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setShowVideo(false)} className="px-6 py-2 text-on-surface-variant hover:text-white rounded-full transition-colors font-medium">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
