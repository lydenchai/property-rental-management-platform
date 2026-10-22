# ==============================================================================
# RentEase - Production Multi-Stage Dockerfile
# ==============================================================================

# Stage 1: Base Alpine Environment with Node.js 20
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl curl
WORKDIR /app

# Stage 2: Install Dependencies & Generate Prisma Client
FROM base AS dependencies
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci --include=dev
RUN npx prisma generate

# Stage 3: Build Application Artifacts
FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
ENV NITRO_PRESET=node-server
RUN npm run build

# Stage 4: Production Minimal Runtime
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Create unprivileged service user and group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy compiled Nitro server bundle and Prisma generated client
COPY --from=builder --chown=nodejs:nodejs /app/.output ./.output
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Switch to non-root user
USER nodejs

EXPOSE 3000

# Container liveness health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://127.0.0.1:3000/api/v1/health || exit 1

CMD ["node", ".output/server/index.mjs"]
