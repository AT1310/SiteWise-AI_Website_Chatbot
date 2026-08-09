import { motion } from 'framer-motion';
import { HiSparkles } from 'react-icons/hi2';

export default function Logo({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  const isLarge = size === 'lg';

  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-[#6c5ce7] to-[#a78bfa] ${
          isLarge ? 'h-12 w-12 text-xl' : 'h-8 w-8 text-sm'
        }`}
        style={{ boxShadow: '0 0 20px rgba(108, 92, 231, 0.3)' }}
      >
        <HiSparkles className="text-white" />
      </div>
      <div>
        <h1
          className={`font-bold bg-gradient-to-r from-white to-[#8888a0] bg-clip-text text-transparent ${
            isLarge ? 'text-2xl' : 'text-base'
          }`}
        >
          AI Website Chatbot
        </h1>
        {isLarge && (
          <p className="text-xs text-[#8888a0] tracking-wide mt-0.5">
            Chat with any public website
          </p>
        )}
      </div>
    </motion.div>
  );
}
