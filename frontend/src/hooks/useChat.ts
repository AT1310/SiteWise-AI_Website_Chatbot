import { useCallback, useRef, useState } from "react";
import { sendChatMessage } from "../services/chat";
import { apiErrorMessage } from "../services/api";
import type { Message } from "../types/chat";

interface UseChatOptions {
  url: string;
  sessionId?: string;
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function useChat({ url, sessionId }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "streaming">("idle");
  const abortRef = useRef<{ stop: boolean }>({ stop: false });

  const simulateTyping = useCallback((id: string, full: string) => {
    return new Promise<void>((resolve) => {
      abortRef.current.stop = false;
      const chunkSize = Math.max(2, Math.floor(full.length / 120));
      let i = 0;
      const tick = () => {
        if (abortRef.current.stop) {
          setMessages((m) =>
            m.map((msg) =>
              msg.id === id ? { ...msg, content: full, streaming: false } : msg,
            ),
          );
          return resolve();
        }
        i = Math.min(full.length, i + chunkSize);
        setMessages((m) =>
          m.map((msg) =>
            msg.id === id ? { ...msg, content: full.slice(0, i) } : msg,
          ),
        );
        if (i >= full.length) {
          setMessages((m) =>
            m.map((msg) => (msg.id === id ? { ...msg, streaming: false } : msg)),
          );
          return resolve();
        }
        setTimeout(tick, 12);
      };
      tick();
    });
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || status !== "idle") return;

      const userMsg: Message = {
        id: uid(),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
      };
      const placeholder: Message = {
        id: uid(),
        role: "assistant",
        content: "",
        createdAt: Date.now(),
        streaming: true,
      };
      const history = messages.map((m) => ({ role: m.role, content: m.content }));

      setMessages((m) => [...m, userMsg, placeholder]);
      setStatus("sending");

      try {
        const resp = await sendChatMessage({
          url,
          session_id: sessionId,
          message: trimmed,
          history,
        });
        const answer =
          resp.answer ||
          resp.response ||
          resp.message ||
          "I couldn't produce a response.";
        setMessages((m) =>
          m.map((msg) =>
            msg.id === placeholder.id
              ? { ...msg, sources: resp.sources ?? [] }
              : msg,
          ),
        );
        setStatus("streaming");
        await simulateTyping(placeholder.id, answer);
      } catch (err) {
        setMessages((m) =>
          m.map((msg) =>
            msg.id === placeholder.id
              ? {
                  ...msg,
                  content: `⚠️ ${apiErrorMessage(err)}`,
                  streaming: false,
                  error: true,
                }
              : msg,
          ),
        );
      } finally {
        setStatus("idle");
      }
    },
    [messages, sessionId, simulateTyping, status, url],
  );

  const regenerate = useCallback(async () => {
    // Find last user message; drop everything after it, resend.
    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === "user");
    if (lastUserIdx === -1) return;
    const idx = messages.length - 1 - lastUserIdx;
    const lastUser = messages[idx];
    setMessages(messages.slice(0, idx));
    await send(lastUser.content);
  }, [messages, send]);

  const stop = useCallback(() => {
    abortRef.current.stop = true;
  }, []);

  const clear = useCallback(() => setMessages([]), []);

  return { messages, status, send, regenerate, stop, clear };
}
