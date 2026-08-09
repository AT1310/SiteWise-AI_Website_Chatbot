import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { HiSparkles, HiXMark, HiTrash } from "react-icons/hi2";
import { useChat } from "../../hooks/useChat";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { MessageBubble } from "../chat/MessageBubble";
import { Composer } from "../chat/Composer";
import { SuggestedQuestions } from "../chat/SuggestedQuestions";
import { hostnameOf } from "../../utils/url";

interface Props {
  url: string;
  sessionId?: string;
}

export function ChatWidget({ url, sessionId }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const { messages, status, send, regenerate, stop, clear } = useChat({ url, sessionId });
  const scrollRef = useAutoScroll<HTMLDivElement>(messages);

  const submit = () => {
    const v = draft.trim();
    if (!v) return;
    setDraft("");
    void send(v);
  };

  const streaming = status !== "idle";

  return (
    <>
      {/* Launcher */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="launcher"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="btn-brand animate-pulse-glow fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full"
            aria-label="Ask AI"
          >
            <HiSparkles size={24} />
            <span className="pointer-events-none absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-card px-3 py-1.5 text-xs shadow-lg opacity-0 transition group-hover:opacity-100">
              Ask AI
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
            className="glass fixed bottom-6 right-6 z-40 flex h-[min(640px,calc(100vh-3rem))] w-[min(420px,calc(100vw-3rem))] flex-col rounded-3xl shadow-[var(--shadow-elevated)]"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <div className="btn-brand grid h-9 w-9 place-items-center rounded-full">
                <HiSparkles size={16} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">AI Assistant</div>
                <div className="truncate text-[11px] text-muted-foreground">
                  Chatting with {hostnameOf(url)}
                </div>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={clear}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  aria-label="Clear"
                >
                  <HiTrash size={16} />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                aria-label="Close"
              >
                <HiXMark size={18} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col justify-between">
                  <div className="pt-4 text-center">
                    <div className="btn-brand mx-auto grid h-12 w-12 place-items-center rounded-2xl">
                      <HiSparkles size={22} />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-semibold">
                      Ready when you are
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      I've indexed{" "}
                      <span className="font-medium text-foreground">
                        {hostnameOf(url)}
                      </span>
                      . Ask me anything.
                    </p>
                  </div>
                  <div className="pt-6">
                    <SuggestedQuestions
                      hostname={hostnameOf(url)}
                      onPick={(q) => { setDraft(""); void send(q); }}
                    />
                  </div>
                </div>
              ) : (
                messages.map((m, i) => (
                  <MessageBubble
                    key={m.id}
                    message={m}
                    canRegenerate={
                      i === messages.length - 1 && m.role === "assistant" && status === "idle"
                    }
                    onRegenerate={() => void regenerate()}
                  />
                ))
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-border p-3">
              <Composer
                value={draft}
                onChange={setDraft}
                onSubmit={submit}
                onStop={stop}
                disabled={streaming}
                streaming={streaming}
              />
              <div className="mt-1.5 px-1 text-center text-[10px] text-muted-foreground">
                Responses are generated from indexed content and may be imperfect.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
