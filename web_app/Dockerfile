# ============================================================
# GigToGeek — Web App (Vite + React) — Dev Dockerfile
# ============================================================

FROM node:22-alpine

WORKDIR /app

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

EXPOSE 5173

# Run Vite dev server bound to 0.0.0.0 so Docker can expose it
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
