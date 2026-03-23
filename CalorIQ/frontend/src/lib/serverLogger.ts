type LogMeta = Record<string, unknown>;

function serialize(meta?: LogMeta): string {
  if (!meta) return "";
  try {
    return JSON.stringify(meta);
  } catch {
    return "[unserializable-meta]";
  }
}

export function logServerInfo(event: string, meta?: LogMeta) {
  // Route handlers run on server runtime, so console output lands in server logs.
  console.info(`[server] ${event} ${serialize(meta)}`);
}

export function logServerError(event: string, error: unknown, meta?: LogMeta) {
  if (error instanceof Error) {
    const errorWithCause = error as Error & { cause?: unknown };
    const cause =
      errorWithCause.cause instanceof Error
        ? {
            name: errorWithCause.cause.name,
            message: errorWithCause.cause.message,
          }
        : errorWithCause.cause;
    console.error(
      `[server] ${event} ${serialize({
        ...meta,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          cause,
        },
      })}`
    );
    return;
  }

  console.error(`[server] ${event} ${serialize({ ...meta, error: String(error) })}`);
}
