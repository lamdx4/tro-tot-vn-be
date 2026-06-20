# ============================================
# Stage 1: Builder
# ============================================
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for TypeScript compilation)
RUN npm ci

# Copy source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Remove devDependencies to keep the production node_modules extremely small
RUN npm prune --omit=dev

# ============================================
# Stage 2: Runtime (Trọng lượng siêu nhẹ)
# ============================================
FROM node:22-bookworm-slim AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# ---------------------------------------------------------
# Security: Run as a non-root user (Debian syntax)
# ---------------------------------------------------------
RUN groupadd -g 1001 nodejs && \
    useradd -u 1001 -g nodejs -s /bin/bash -m nodeuser

# Copy only the compiled code and production dependencies from the builder
COPY --from=builder --chown=nodeuser:nodejs /app/dist ./dist
COPY --from=builder --chown=nodeuser:nodejs /app/docs ./docs
COPY --from=builder --chown=nodeuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodeuser:nodejs /app/package.json ./
COPY --from=builder --chown=nodeuser:nodejs /app/.env* ./
COPY --from=builder --chown=nodeuser:nodejs /app/trot-tot-firebase-adminsdk*.json ./


# Create uploads directory for user files
RUN mkdir -p uploads && chown nodeuser:nodejs uploads

# Switch to the non-root user
USER nodeuser

# Expose the API port (Default for backend is usually 3000)
EXPOSE 3333

# Start the application
CMD ["node", "dist/app.js"]
