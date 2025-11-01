# ========================
# 🏗 Etapa 1: Build
# ========================
FROM node:20 AS builder
WORKDIR /app

# Copiar archivos base
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el código fuente
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Compilar el proyecto
RUN npm run build

# ========================
# 🚀 Etapa 2: Runtime
# ========================
FROM node:20-alpine AS production
WORKDIR /app

# Copiar archivos necesarios
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/ptsconfig*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Exponer puerto
EXPOSE 3000

# Variables de entorno que Railway debe definir
# DATABASE_URL debe estar en Railway
ENV NODE_ENV=production

# Arrancar la app
CMD npx prisma generate && node dist/src/main.js
