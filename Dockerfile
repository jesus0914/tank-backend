# Etapa 1: build
FROM node:20 AS builder
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Compilar el proyecto NestJS
RUN npm run build

# Etapa 2: runtime (producción)
FROM node:20-alpine AS production
WORKDIR /app

# Copiar archivos necesarios desde la etapa anterior
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Generar el cliente de Prisma usando la variable DATABASE_URL del entorno (Railway)
CMD npx prisma generate && node dist/src/main.js
