# ========================
# 🏗️ Etapa 1: Build
# ========================
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY prisma ./prisma
COPY . .

RUN npm install
RUN npm run build

# ========================
# 🚀 Etapa 2: Runtime
# ========================
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# 👇 Ejecuta prisma generate ANTES de correr tu app
CMD npx prisma generate && node dist/src/main.js
