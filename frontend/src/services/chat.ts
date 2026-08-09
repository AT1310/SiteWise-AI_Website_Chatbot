import { api } from "./api";
import type { ChatRequest, ChatResponse } from "../types/api";

export async function sendChatMessage(req: ChatRequest): Promise<ChatResponse> {
  const payload = { question: req.message, history: req.history };
  const { data } = await api.post<ChatResponse>("/chat", payload);
  return data;
}
