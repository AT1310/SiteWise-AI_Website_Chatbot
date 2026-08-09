import { motion } from 'framer-motion';

export default function ChatSkeleton() {
  return (
    <motion.div
      className="flex gap-3 px-1"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#a78bfa] flex items-center justify-center flex-shrink-0 text-xs text-white font-bold">
        AI
      </div>

      {/* Skeleton lines */}
      <div className="flex-1 space-y-3 pt-1">
        <div className="skeleton-line w-[85%]" />
        <div className="skeleton-line w-[70%]" />
        <div className="skeleton-line w-[55%]" />
        <div className="skeleton-line w-[75%]" />
      </div>
    </motion.div>
  );
}
