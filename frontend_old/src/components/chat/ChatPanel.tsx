import { motion } from 'framer-motion';
import { HiXMark, HiTrash, HiSparkles } from 'react-icons/hi2';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ChatEmpty from './ChatEmpty';
import { useChat } from '../../hooks/useChat';

interface ChatPanelProps {
  onClose: () => void;
  websiteTitle: string;
}

export default function ChatPanel({ onClose, websiteTitle }: ChatPanelProps) {
  const { messages, isLoading, error, sendMessage, clearMessages, bottomRef } = useChat();

  return (
    <motion.div
      className="flex flex-col w-[400px] h-[600px] max-h-[80vh] rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.08)]"
      style={{
        background: 'rgba(18, 18, 26, 0.95)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(108,92,231,0.08)',
      }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#a78bfa] flex items-center justify-center">
          <HiSparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#f0f0f5]">AI Assistant</p>
          <p className="text-[11px] text-[#8888a0] truncate">{websiteTitle}</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearMessages}
            className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-[#55556a] hover:text-[#8888a0] transition-colors cursor-pointer"
            title="Clear chat"
          >
            <HiTrash className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-[#55556a] hover:text-[#f0f0f5] transition-colors cursor-pointer"
          title="Close"
        >
          <HiXMark className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {messages.length === 0 ? (
          <ChatEmpty onSuggestionClick={sendMessage} />
        ) : (
          messages.map(msg => <ChatMessage key={msg.id} message={msg} />)
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center"
          >
            {error}
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </motion.div>
  );
}
