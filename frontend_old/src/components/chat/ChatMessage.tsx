import { motion } from 'framer-motion';
import { useState } from 'react';
import { HiUser, HiClipboardDocument, HiCheck } from 'react-icons/hi2';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ChatSources from './ChatSources';
import ChatSkeleton from './ChatSkeleton';
import type { ChatMessageType } from '../../types/api';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  if (message.isLoading) {
    return <ChatSkeleton />;
  }

  return (
    <motion.div
      className={`flex gap-3 px-1 ${isUser ? 'flex-row-reverse' : ''}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Avatar */}
      {isUser ? (
        <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center flex-shrink-0">
          <HiUser className="w-4 h-4 text-[#8888a0]" />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#a78bfa] flex items-center justify-center flex-shrink-0 text-xs text-white font-bold">
          AI
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'text-right' : ''}`}>
        <div
          className={`inline-block text-left rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-r from-[#6c5ce7] to-[#7c6ef7] text-white'
              : 'bg-[rgba(255,255,255,0.04)] text-[#f0f0f5] border border-[rgba(255,255,255,0.06)]'
          }`}
        >
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <>
              <div className="chat-markdown">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeStr = String(children).replace(/\n$/, '');

                      if (match) {
                        return (
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                            }}
                          >
                            {codeStr}
                          </SyntaxHighlighter>
                        );
                      }
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>

              {/* Copy button */}
              <CopyButton text={message.content} />

              {/* Sources */}
              {message.sources && message.sources.length > 0 && (
                <ChatSources sources={message.sources} />
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="mt-2 flex items-center gap-1 text-[10px] text-[#55556a] hover:text-[#8888a0] transition-colors cursor-pointer"
    >
      {copied ? (
        <>
          <HiCheck className="w-3 h-3 text-[#00d2a0]" />
          <span className="text-[#00d2a0]">Copied</span>
        </>
      ) : (
        <>
          <HiClipboardDocument className="w-3 h-3" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}
