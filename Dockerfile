# ===============================
# Etapa 1: Builder
# ===============================
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Copiamos .env solo si existe (Railway no lo tendrá)
RUN if [ -f .env ]; then cp .env .env; fi

# ❌ Quitamos el prisma generate (Railway no tiene las envs en build)
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

# Copiamos .env si existe (Railway lo ignora)
RUN if [ -f .env ]; then cp .env .env; fi

ENV NODE_ENV=production
EXPOSE 3000

# ✅ Generamos Prisma Client ya con las variables de entorno cargadas
CMD npx prisma generate && node dist/src/main.js
