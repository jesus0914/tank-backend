# ========================
# 🏗️ Etapa 1: Build
# ========================
FROM node:20 AS builder
WORKDIR /app

# Copiar explícitamente los archivos base
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./

# Verificar que se copiaron correctamente
RUN echo "📦 Archivos copiados en /app:" && ls -la /app

# Instalar dependencias
RUN npm ci || npm install

# Copiar el resto del código fuente
COPY . .

# Compilar el proyecto (NestJS)
RUN npm run build


# ========================
# 🚀 Etapa 2: Runtime
# ========================
FROM node:20-alpine AS production
WORKDIR /app

# Copiar solo lo necesario desde la etapa anterior
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Exponer el puerto de la app
EXPOSE 3000

# Generar Prisma Client y arrancar la app
CMD npx prisma generate && node dist/src/main.js
