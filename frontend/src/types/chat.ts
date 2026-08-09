import type { ChatSource } from "./api";

export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
  sources?: ChatSource[];
  createdAt: number;
  streaming?: boolean;
  error?: boolean;
}
