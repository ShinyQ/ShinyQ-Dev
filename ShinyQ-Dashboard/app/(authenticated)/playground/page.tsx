"use client";

import { useCallback, useRef, useState } from "react";

import {
  Bot,
  Check,
  ChevronDown,
  Copy,
  Loader2,
  RotateCcw,
  Send,
  Settings2,
  Sparkles,
  User,
} from "lucide-react";

import { PageContainer } from "@/components/dashboard/page-container";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  tokens?: number;
  latency?: number;
}

const availableModels = [
  { id: "claude-sonnet-4", name: "Claude Sonnet 4", provider: "Anthropic" },
  { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", provider: "Anthropic" },
  { id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google" },
  { id: "llama-3.3-70b", name: "Llama 3.3 70B", provider: "Meta" },
];

const presetPrompts = [
  {
    label: "Summarize",
    prompt: "Summarize the following text in 3 bullet points:",
  },
  {
    label: "Code Review",
    prompt:
      "Review this code for bugs, performance issues, and best practices:",
  },
  {
    label: "Explain",
    prompt: "Explain this concept in simple terms, suitable for a beginner:",
  },
  {
    label: "Translate",
    prompt: "Translate the following to professional English:",
  },
];

// Simulated AI responses for demo
const demoResponses = [
  "Based on my analysis, here are the key findings:\n\n1. **Performance Optimization**: The current implementation shows room for improvement in query batching. Consider implementing a request queue to reduce API round-trips.\n\n2. **Error Handling**: I'd recommend adding retry logic with exponential backoff for transient failures.\n\n3. **Cost Efficiency**: By switching to a smaller model for classification tasks, you could reduce costs by approximately 40% without significant accuracy loss.",
  "Here's a structured approach to solving this:\n\n```python\ndef process_pipeline(data):\n    # Step 1: Validate input\n    validated = validate_schema(data)\n    \n    # Step 2: Transform\n    transformed = apply_transforms(validated)\n    \n    # Step 3: Enrich with AI\n    enriched = await model.generate(transformed)\n    \n    return enriched\n```\n\nThis pattern ensures data integrity at each stage while maintaining clear separation of concerns.",
  "Great question! Let me break this down:\n\n- **Tokens** are the basic units that language models process. Think of them as word pieces — common words are single tokens, while unusual words get split into multiple tokens.\n\n- **Context Window** refers to the maximum number of tokens a model can consider at once. A 200K context window means the model can process roughly 150,000 words in a single conversation.\n\n- **Temperature** controls randomness: 0.0 gives deterministic outputs, while 1.0 produces more creative and varied responses.\n\nThe key trade-off is between **cost** (more tokens = higher cost) and **quality** (more context = better understanding).",
];

export default function PlaygroundPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(availableModels[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful AI assistant.",
  );
  const [showSettings, setShowSettings] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [totalTokens, setTotalTokens] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const responseIndex = useRef(0);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isGenerating) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      tokens: Math.ceil(input.trim().split(/\s+/).length * 1.3),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsGenerating(true);
    scrollToBottom();

    // Simulate AI response with typing delay
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 1800));

    const responseContent =
      demoResponses[responseIndex.current % demoResponses.length];
    responseIndex.current++;
    const responseTokens = Math.ceil(responseContent.split(/\s+/).length * 1.3);
    const latency = Math.floor(200 + Math.random() * 400);

    const assistantMsg: Message = {
      id: `msg-${Date.now()}-ai`,
      role: "assistant",
      content: responseContent,
      timestamp: new Date(),
      tokens: responseTokens,
      latency,
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setTotalTokens((prev) => prev + (userMsg.tokens ?? 0) + responseTokens);
    setTotalCost(
      (prev) => prev + ((userMsg.tokens ?? 0) + responseTokens) * 0.003,
    );
    setIsGenerating(false);
    scrollToBottom();
  }, [input, isGenerating, scrollToBottom]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReset = () => {
    setMessages([]);
    setTotalTokens(0);
    setTotalCost(0);
    responseIndex.current = 0;
  };

  return (
    <PageContainer>
      <PageHeader
        title="Playground"
        description="Test and iterate on prompts with different models."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings2 className="mr-1.5 size-3.5" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="mr-1.5 size-3.5" />
              Reset
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Chat Area */}
        <div className="flex flex-col lg:col-span-3">
          {/* Model Picker + Presets */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setShowModelPicker(!showModelPicker)}
              >
                <Bot className="size-3.5" />
                {selectedModel.name}
                <ChevronDown className="size-3" />
              </Button>
              {showModelPicker && (
                <div className="absolute left-0 top-full z-10 mt-1 w-64 rounded-lg border border-border bg-card p-1 shadow-lg">
                  {availableModels.map((m) => (
                    <button
                      key={m.id}
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                      onClick={() => {
                        setSelectedModel(m);
                        setShowModelPicker(false);
                      }}
                    >
                      <span className="font-medium">{m.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {m.provider}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-border" />

            {presetPrompts.map((p) => (
              <Button
                key={p.label}
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setInput(p.prompt + " ")}
              >
                {p.label}
              </Button>
            ))}
          </div>

          {/* Messages */}
          <Card className="flex min-h-[500px] flex-1 flex-col">
            <CardContent className="flex flex-1 flex-col p-0">
              <div className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 rounded-2xl bg-primary/10 p-4">
                      <Sparkles className="size-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">
                      Start a conversation
                    </h3>
                    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                      Select a model, type a prompt, and see how different
                      models respond. Use presets for common tasks.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
                      >
                        {msg.role === "assistant" && (
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Bot className="size-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={`group relative max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted/50"
                          }`}
                        >
                          <div className="whitespace-pre-wrap">
                            {msg.content}
                          </div>
                          {msg.role === "assistant" && (
                            <div className="mt-2 flex items-center gap-3 border-t border-border/50 pt-2 text-[10px] text-muted-foreground">
                              <span>{msg.tokens} tokens</span>
                              <span>{msg.latency}ms</span>
                              <button
                                onClick={() => handleCopy(msg.id, msg.content)}
                                className="ml-auto opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                {copiedId === msg.id ? (
                                  <Check className="size-3 text-emerald-500" />
                                ) : (
                                  <Copy className="size-3" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                        {msg.role === "user" && (
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground/10">
                            <User className="size-4" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isGenerating && (
                      <div className="flex gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Bot className="size-4 text-primary" />
                        </div>
                        <div className="rounded-xl bg-muted/50 px-4 py-3">
                          <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-border p-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your prompt..."
                    className="flex-1"
                    disabled={isGenerating}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isGenerating}
                    size="sm"
                    className="shrink-0"
                  >
                    {isGenerating ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                  </Button>
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground">
                  Press Enter to send. Shift+Enter for new line. Demo mode —
                  responses are simulated.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar — Settings & Stats */}
        <div className="space-y-4">
          {/* Session Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Session Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Messages</span>
                <span className="font-medium tabular-nums">
                  {messages.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Tokens</span>
                <span className="font-medium tabular-nums">
                  {totalTokens.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Est. Cost</span>
                <span className="font-medium tabular-nums">
                  ${totalCost.toFixed(4)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Model</span>
                <Badge variant="secondary" className="text-[10px]">
                  {selectedModel.name}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Parameters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Parameters</CardTitle>
              <CardDescription className="text-xs">
                Fine-tune model behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">
                    Temperature
                  </label>
                  <span className="text-xs tabular-nums text-foreground">
                    {temperature}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.1}
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
                />
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">
                    Max Tokens
                  </label>
                  <span className="text-xs tabular-nums text-foreground">
                    {maxTokens}
                  </span>
                </div>
                <input
                  type="range"
                  min={256}
                  max={4096}
                  step={256}
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(Number(e.target.value))}
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  System Prompt
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="h-20 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Set the AI's behavior..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mb-8" />
    </PageContainer>
  );
}
