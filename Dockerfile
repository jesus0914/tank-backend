# -------------------------------------------------------
# 🏗️ Etapa 1: Compilación
# -------------------------------------------------------
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

# Compilar NestJS (sin generar Prisma aún)
RUN npm run build


# -------------------------------------------------------
# 🚀 Etapa 2: Producción
# -------------------------------------------------------
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Prisma se generará en tiempo de ejecución (ya con DATABASE_URL disponible)
EXPOSE 3000

# Comando de inicio: generar Prisma y luego ejecutar NestJS
CMD npx prisma generate && node dist/main.js
