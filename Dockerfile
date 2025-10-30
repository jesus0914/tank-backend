# ===============================
# Etapa 1: Builder (compila Nest y genera Prisma)
# ===============================
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Copiamos .env solo si existe (Railway no lo tendrá)
RUN if [ -f .env ]; then cp .env .env; fi

# Generamos Prisma Client
RUN npx prisma generate

RUN npm run build


# ===============================
# Etapa 2: Producción (imagen final ligera)
# ===============================
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Copiamos .env solo si existe (Railway lo ignora)
RUN if [ -f .env ]; then cp .env .env; fi

ENV NODE_ENV=production
EXPOSE 3000

CMD npx prisma generate && node dist/src/main.js
