import { motion } from 'framer-motion';
import { HiArrowTopRightOnSquare } from 'react-icons/hi2';
import type { Source } from '../../types/api';

interface ChatSourcesProps {
  sources: Source[];
}

export default function ChatSources({ sources }: ChatSourcesProps) {
  if (!sources.length) return null;

  return (
    <motion.div
      className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <p className="text-[10px] uppercase tracking-wider text-[#55556a] mb-2 font-medium">
        Sources
      </p>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, i) => (
          <a
            key={i}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[rgba(108,92,231,0.08)] hover:bg-[rgba(108,92,231,0.15)] border border-[rgba(108,92,231,0.15)] hover:border-[rgba(108,92,231,0.3)] transition-all text-xs text-[#a78bfa] hover:text-[#c4b5fd] max-w-[200px] truncate"
            title={source.title}
          >
            <HiArrowTopRightOnSquare className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{source.title || source.url}</span>
          </a>
        ))}
      </div>
    </motion.div>
  );
}
