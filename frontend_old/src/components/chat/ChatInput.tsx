import { useState, type FormEvent, useRef, useEffect } from 'react';
import { HiPaperAirplane } from 'react-icons/hi2';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-[rgba(255,255,255,0.06)]">
      <div className="flex items-end gap-2 bg-[#0a0a0f] rounded-xl border border-[rgba(255,255,255,0.08)] focus-within:border-[rgba(108,92,231,0.4)] transition-colors px-4 py-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about this website..."
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent border-none outline-none text-sm text-[#f0f0f5] placeholder-[#55556a] resize-none py-1.5 max-h-[120px]"
        />
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="p-2 rounded-lg bg-gradient-to-r from-[#6c5ce7] to-[#a78bfa] text-white disabled:opacity-30 transition-opacity cursor-pointer flex-shrink-0 hover:shadow-[0_0_15px_rgba(108,92,231,0.3)]"
        >
          <HiPaperAirplane className="w-4 h-4" />
        </button>
      </div>
      <p className="text-[10px] text-[#55556a] mt-2 text-center">
        Shift + Enter for new line
      </p>
    </form>
  );
}
