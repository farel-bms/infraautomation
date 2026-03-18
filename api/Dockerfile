# ── Stage 1: Install dependencies ───────────────────────
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Use ci for reproducible installs; omit devDependencies in production
RUN npm ci --only=production

# ── Stage 2: Runtime ─────────────────────────────────────
FROM node:18-alpine
WORKDIR /app

# Copy only production deps from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY src/ ./src/
COPY package.json ./

# Run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 8080
ENV NODE_ENV=production

CMD ["node", "src/index.js"]
