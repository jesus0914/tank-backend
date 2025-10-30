# ===============================
# Etapa 1: Builder (compila NestJS)
# ===============================
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copiamos todo el código fuente
COPY . .

# ⚠️ OMITIMOS prisma generate aquí (Railway no tiene DATABASE_URL durante build)
# RUN npx prisma generate

# Compilamos NestJS
RUN npm run build


# ===============================
# Etapa 2: Producción
# ===============================
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Railway inyecta automáticamente DATABASE_URL, MQTT, etc.
ENV NODE_ENV=production

EXPOSE 3000

# ✅ Generamos el cliente Prisma en tiempo de ejecución (ya tiene DATABASE_URL)
CMD npx prisma generate && node dist/src/main.js
