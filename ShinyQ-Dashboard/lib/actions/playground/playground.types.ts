export type MessageRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  tokens?: number;
  latencyMs?: number;
};

export type ChatRequest = {
  model: string;
  messages: Array<{ role: MessageRole; content: string }>;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
};

export type ChatResponse = {
  message: ChatMessage;
  usage: { inputTokens: number; outputTokens: number; cost: number };
};
