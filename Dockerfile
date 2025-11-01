# ========================
# 🏗️ Etapa 1: Build
# ========================
FROM node:20 AS builder
WORKDIR /app

# Copiar archivos base
COPY package*.json nest-cli.json tsconfig*.json ./
COPY prisma ./prisma

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Compilar el proyecto (NestJS)
RUN npm run build

# ========================
# 🚀 Etapa 2: Runtime
# ========================
FROM node:20-alpine AS production
WORKDIR /app

# Copiar solo lo necesario del build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Exponer el puerto
EXPOSE 3000

# Generar Prisma y ejecutar la app
CMD npx prisma generate && node dist/src/main.js
