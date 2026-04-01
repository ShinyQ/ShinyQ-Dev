import { findJob } from "@/lib/actions/jobs/jobs.service";
import { getRequestId } from "@/lib/api-client/request-id";

export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const requestId = getRequestId(request);
  const { id } = await ctx.params;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };

      for (let i = 0; i < 200; i++) {
        // Stop if the client disconnected
        if (request.signal.aborted) break;

        const job = findJob(id);
        if (!job) {
          send({ type: "error", message: "Unknown job", requestId });
          break;
        }
        send({
          status: job.status,
          progress: job.progress,
          log: job.log,
          result: job.result,
          error: job.error,
          requestId,
        });
        if (job.status === "completed" || job.status === "failed") {
          break;
        }
        await new Promise((r) => setTimeout(r, 280));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "x-request-id": requestId,
    },
  });
}
