"use server";

import { withActionResult } from "@/lib/actions/middleware.actions";

import { sendChatMessage } from "./playground.service";
import type { ChatRequest } from "./playground.types";

export type {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  MessageRole,
} from "./playground.types";

export async function sendChatMessageResultAction(request: ChatRequest) {
  return withActionResult(() => sendChatMessage(request));
}
