import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlowButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}

export default function GlowButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
}: GlowButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={`
        relative px-8 py-3.5 rounded-xl font-semibold text-white text-sm
        bg-gradient-to-r from-[#6c5ce7] to-[#a78bfa]
        transition-all duration-300 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${!disabled && !loading ? 'hover:shadow-[0_0_30px_rgba(108,92,231,0.4)]' : ''}
        ${className}
      `}
      style={{
        boxShadow: '0 0 20px rgba(108, 92, 231, 0.2)',
      }}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <motion.div
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
          <span>Processing...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
}
