import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChatMessageType } from '../types/api';
import { chatWithWebsite } from '../services/api';
import { generateId } from '../utils/formatters';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (question: string) => {
    if (!question.trim() || isLoading) return;

    setError(null);

    // Add user message
    const userMsg: ChatMessageType = {
      id: generateId(),
      role: 'user',
      content: question.trim(),
      timestamp: new Date(),
    };

    // Add placeholder AI message
    const aiPlaceholder: ChatMessageType = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMsg, aiPlaceholder]);
    setIsLoading(true);

    try {
      const response = await chatWithWebsite(question.trim());

      // Replace placeholder with real response
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiPlaceholder.id
            ? {
                ...msg,
                content: response.answer,
                sources: response.sources,
                confidence: response.confidence,
                isLoading: false,
              }
            : msg
        )
      );
    } catch (err: any) {
      let errorMessage = 'Failed to get a response. Please try again.';
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);

      // Remove the placeholder on error
      setMessages(prev => prev.filter(msg => msg.id !== aiPlaceholder.id));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, clearMessages, bottomRef };
}
