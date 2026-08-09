import { motion } from 'framer-motion';
import { HiSparkles, HiChatBubbleLeftRight } from 'react-icons/hi2';

interface ChatEmptyProps {
  onSuggestionClick: (question: string) => void;
}

const SUGGESTIONS = [
  'What is this website about?',
  'What are the main features?',
  'How do I get started?',
  'Give me a quick summary',
];

export default function ChatEmpty({ onSuggestionClick }: ChatEmptyProps) {
  return (
    <motion.div
      className="flex-1 flex flex-col items-center justify-center px-6 py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Icon */}
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6c5ce7]/20 to-[#a78bfa]/20 flex items-center justify-center mb-5">
        <HiChatBubbleLeftRight className="w-7 h-7 text-[#6c5ce7]" />
      </div>

      <h3 className="text-base font-semibold text-[#f0f0f5] mb-1">AI Assistant</h3>
      <p className="text-sm text-[#8888a0] text-center mb-8 max-w-[240px]">
        Ask anything about this website. I&apos;ll find the answer from the indexed content.
      </p>

      {/* Suggestions */}
      <div className="w-full space-y-2">
        {SUGGESTIONS.map((q, i) => (
          <motion.button
            key={q}
            onClick={() => onSuggestionClick(q)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="w-full text-left px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.06)] hover:border-[rgba(108,92,231,0.3)] hover:bg-[rgba(108,92,231,0.05)] transition-all text-sm text-[#8888a0] hover:text-[#f0f0f5] flex items-center gap-3 cursor-pointer"
          >
            <HiSparkles className="w-3.5 h-3.5 text-[#6c5ce7] flex-shrink-0" />
            {q}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
