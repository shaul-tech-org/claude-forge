# ==========================================
# Stage 1: development server
# ==========================================
FROM node:22-alpine AS development

WORKDIR /app

# Copy source (volume mount will override in dev)
COPY package.json package-lock.json* ./
COPY . .

EXPOSE 5173

# Install deps at runtime (volume mount empties node_modules)
CMD sh -c "npm install && npm run dev"
