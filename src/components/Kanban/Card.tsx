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

const platformColors: Record<string, { bg: string; text: string }> = {
  kling: { bg: 'bg-cyan-900/40', text: 'text-cyan-300' },
  'runway': { bg: 'bg-violet-900/40', text: 'text-violet-300' },
  'wavespeed': { bg: 'bg-indigo-900/40', text: 'text-indigo-300' },
  'luma': { bg: 'bg-blue-900/40', text: 'text-blue-300' },
  'pika': { bg: 'bg-pink-900/40', text: 'text-pink-300' },
  draft: { bg: 'bg-zinc-800/40', text: 'text-zinc-400' },
  manual: { bg: 'bg-zinc-800/40', text: 'text-zinc-400' },
};

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
  const isCompleted = card.status === 'completed' && card.video_url;
  const platform = card.platform || 'draft';
  const colors = platformColors[platform.toLowerCase()] || platformColors.draft;

  return (
    <>
      <motion.div
        ref={(node) => { setNodeRef(node); (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node; }}
        className="kinetic-card relative bg-surface-variant/60 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-outline-variant/20 transition-all duration-500 cursor-grab active:cursor-grabbing w-full"
        style={{ ...style, rotate: isDragging ? 0 : rotation, scale: springScale }}
        whileHover={{ rotate: 0, boxShadow: '0 12px 28px rgba(0,0,0,0.3)', zIndex: 10, borderColor: 'rgba(189,157,255,0.3)' }}
        whileDrag={{ rotate: 3, boxShadow: '0 30px 60px rgba(0,0,0,0.5)', scale: 1.05 }}
        {...attributes}
        {...listeners}
      >
        {/* Thumbnail Area */}
        <div className="aspect-video rounded-xl overflow-hidden mb-3 bg-zinc-800 flex items-center justify-center relative">
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
              <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Generating...</span>
            </div>
          ) : card.status === 'failed' ? (
            <div className="flex flex-col items-center gap-1 text-error">
              <span className="material-symbols-outlined text-2xl">error</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Failed</span>
            </div>
          ) : (
            <span className="material-symbols-outlined text-zinc-600 text-4xl">movie</span>
          )}
        </div>

        {/* Platform & Duration */}
        <div className="flex justify-between items-start mb-2">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${colors.text}`}>
            {platform}
          </span>
          {card.duration && <span className="text-[10px] text-on-surface-variant">{card.duration}</span>}
        </div>

        {/* Prompt */}
        <p className="text-xs text-zinc-300 font-medium leading-tight line-clamp-2">
          {card.prompt || 'Sem prompt'}
        </p>

        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-outline-variant/10 flex justify-between items-center">
          {card.aspect_ratio && (
            <span className="bg-secondary-container/30 text-secondary px-2 py-0.5 rounded text-[10px] font-medium">
              {card.aspect_ratio}
            </span>
          )}
          {card.model_name && (
            <span className="text-[10px] text-on-surface-variant">{card.model_name}</span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="ml-auto p-1 text-zinc-600 hover:text-error rounded transition-colors opacity-0 group-hover:opacity-100"
          >
            <span className="material-symbols-outlined text-sm">more_horiz</span>
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
              {card.model_name && <p className="text-sm text-on-surface-variant"><strong className="text-on-surface">Model:</strong> {card.model_name}</p>}
              {card.aspect_ratio && <p className="text-sm text-on-surface-variant"><strong className="text-on-surface">Ratio:</strong> {card.aspect_ratio}</p>}
              {card.duration && <p className="text-sm text-on-surface-variant"><strong className="text-on-surface">Duration:</strong> {card.duration}</p>}
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setShowVideo(false)} className="px-6 py-2 text-on-surface-variant hover:text-white rounded-full transition-colors font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
