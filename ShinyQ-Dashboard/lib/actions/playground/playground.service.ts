import type { ChatRequest, ChatResponse } from "./playground.types";

/**
 * Playground service — wire to your inference gateway or AI provider API.
 *
 * Currently returns a simulated response. Replace with real API calls
 * via internalJson() from @/lib/api-client.
 */

export async function sendChatMessage(
  request: ChatRequest,
): Promise<ChatResponse> {
  // TODO: replace with actual model inference via internalJson("/api/v1/chat", ...)
  const content =
    `This is a simulated response from ${request.model}. ` +
    "Replace this service with your inference gateway integration.";

  return {
    message: {
      id: crypto.randomUUID(),
      role: "assistant",
      content,
      timestamp: new Date().toISOString(),
      tokens: content.split(/\s+/).length * 2,
      latencyMs: Math.floor(Math.random() * 2000) + 500,
    },
    usage: { inputTokens: 150, outputTokens: 80, cost: 0.0023 },
  };
}
