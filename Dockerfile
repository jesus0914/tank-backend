# -------------------------------------------------------
# 🏗️ Etapa 1: Construcción del proyecto NestJS
# -------------------------------------------------------
FROM node:20 AS builder

WORKDIR /app

# Copiamos package.json e instalamos dependencias
COPY package*.json ./
RUN npm install

# Copiamos el resto del código fuente
COPY . .

# Compilamos el proyecto (NestJS → dist)
RUN npm run build


# -------------------------------------------------------
# 🚀 Etapa 2: Producción (imagen más liviana)
# -------------------------------------------------------
FROM node:20-alpine AS production

WORKDIR /app

# Copiamos dependencias y build del builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Prisma se generará al inicio (Railway inyecta DATABASE_URL)
EXPOSE 3000

# Comando de inicio:
# 1. Genera Prisma Client
# 2. Arranca la app NestJS compilada
CMD npx prisma generate && node dist/src/main.js

