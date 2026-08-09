import { motion } from "framer-motion";
import { useState } from "react";
import { HiClipboard, HiCheck, HiArrowPath, HiUser } from "react-icons/hi2";
import { HiSparkles } from "react-icons/hi2";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message } from "../../types/chat";
import { Sources } from "./Sources";

interface Props {
  message: Message;
  onRegenerate?: () => void;
  canRegenerate?: boolean;
}

export function MessageBubble({ message, onRegenerate, canRegenerate }: Props) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
          isUser
            ? "bg-white/10 text-foreground"
            : "btn-brand text-brand-foreground"
        }`}
      >
        {isUser ? <HiUser size={16} /> : <HiSparkles size={16} />}
      </div>

      <div className={`flex max-w-[85%] flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm ${
            isUser
              ? "bg-gradient-to-br from-brand to-[oklch(0.66_0.19_305)] text-brand-foreground"
              : "glass"
          } ${message.error ? "border-destructive/40" : ""}`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <div className="md-content">
              {message.content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              ) : (
                <TypingDots />
              )}
              {message.streaming && message.content && (
                <span className="ml-0.5 inline-block h-4 w-1.5 -mb-0.5 animate-pulse bg-brand align-middle" />
              )}
            </div>
          )}
        </div>

        {!isUser && message.sources && message.sources.length > 0 && (
          <Sources sources={message.sources} />
        )}

        {!isUser && !message.streaming && message.content && (
          <div className="mt-1.5 flex gap-1">
            <button
              onClick={copy}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
              aria-label="Copy"
            >
              {copied ? <HiCheck size={12} /> : <HiClipboard size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
            {canRegenerate && (
              <button
                onClick={onRegenerate}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
              >
                <HiArrowPath size={12} /> Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-1.5 w-1.5 rounded-full bg-muted-foreground"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}
