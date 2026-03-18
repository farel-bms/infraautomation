# ── Stage 1: Build ──────────────────────────────────────
# Use Node 18 Alpine for a smaller build image
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first so Docker can cache this layer
# and skip npm ci if dependencies haven't changed
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Serve ───────────────────────────────────────
# Switch to minimal Nginx Alpine — no Node.js in the final image
FROM nginx:alpine

# Copy the Vite build output from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Use our custom Nginx config (handles React Router + health endpoint)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Run as non-root for security compliance
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
  && chown -R appuser:appgroup /usr/share/nginx/html \
  && chown -R appuser:appgroup /var/cache/nginx \
  && chown -R appuser:appgroup /var/log/nginx \
  && touch /var/run/nginx.pid \
  && chown appuser:appgroup /var/run/nginx.pid

USER appuser

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
