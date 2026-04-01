"use client";

import { useState, useTransition } from "react";

import { CheckCircle, Play, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { getWelcomeMessageResultAction } from "@/lib/actions/example/example.actions";

export function ServerActionDemo() {
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run() {
    setErr(null);
    setMsg(null);
    startTransition(async () => {
      const result = await getWelcomeMessageResultAction();
      if (result.ok) {
        setMsg(`${result.data.message} (${result.data.at})`);
        toast({
          title: "Success",
          description: "Server action completed.",
          variant: "success",
        });
      } else {
        setErr(result.error.message);
        toast({
          variant: "destructive",
          title: "Action failed",
          description: result.error.message,
        });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Server Action</CardTitle>
        <CardDescription>
          Test the{" "}
          <code className="rounded bg-muted px-1 text-xs">
            ActionResult&lt;T&gt;
          </code>{" "}
          pattern with live feedback.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          onClick={run}
          disabled={pending}
          className="gap-2"
        >
          <Play className="size-3.5" />
          {pending ? "Running..." : "Run Server Action"}
        </Button>
        {msg ? (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            <CheckCircle className="mt-0.5 size-4 shrink-0" />
            <span className="break-all">{msg}</span>
          </div>
        ) : null}
        {err ? (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <XCircle className="mt-0.5 size-4 shrink-0" />
            <span>{err}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
