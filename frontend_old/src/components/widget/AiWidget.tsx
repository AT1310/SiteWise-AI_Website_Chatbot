import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSparkles } from 'react-icons/hi2';
import ChatPanel from '../chat/ChatPanel';

interface AiWidgetProps {
  websiteTitle: string;
}

export default function AiWidget({ websiteTitle }: AiWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Expanded Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <ChatPanel onClose={() => setIsOpen(false)} websiteTitle={websiteTitle} />
        )}
      </AnimatePresence>

      {/* Floating Button */}
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="group relative w-14 h-14 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#a78bfa] text-white flex items-center justify-center cursor-pointer"
          style={{
            boxShadow: '0 0 25px rgba(108,92,231,0.4), 0 8px 20px rgba(0,0,0,0.3)',
            animation: 'glow-pulse 3s ease-in-out infinite',
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <HiSparkles className="w-6 h-6" />

          {/* Tooltip */}
          <span className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-[#1a1a2e] border border-[rgba(255,255,255,0.08)] text-xs text-[#f0f0f5] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Ask AI
          </span>
        </motion.button>
      )}
    </div>
  );
}
