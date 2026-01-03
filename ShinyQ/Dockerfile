# Stage 1: Dependencies
FROM oven/bun:1-slim AS deps
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./
# Frozen lockfile memastikan versi package sama persis dengan lokal
RUN bun install --frozen-lockfile

# Stage 2: Builder
FROM oven/bun:1-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ARG NEXT_TELEMETRY_DISABLED=1
ENV NEXT_TELEMETRY_DISABLED=$NEXT_TELEMETRY_DISABLED \
    NODE_ENV=production

# Build the application
# Note: We rely on ISR (revalidate) for data fetching, so no secrets are needed here.
RUN bun run build

# Stage 3: Runner
FROM oven/bun:1-slim AS runner
WORKDIR /app

# Set Runtime Environment
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# Security: Combine user and group creation
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# Create .next/cache directory and set permissions
# This ensures Next.js can write image cache even when running as non-root
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next

# Copy files with permission
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Run Next.js server with bun
CMD ["bun", "server.js"]