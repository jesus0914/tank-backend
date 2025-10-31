# ========================
# 🏗️ Etapa 1: Build
# ========================
FROM node:20 AS builder
WORKDIR /app

# ✅ Copiar archivos base para dependencias y compilación
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./

# ✅ Mostrar archivos copiados
RUN echo "📦 Archivos copiados en /app:" && ls -la /app

# ✅ Instalar dependencias
RUN npm install

# ✅ Copiar el resto del código fuente
COPY . .

# ✅ Verificar contenido final antes del build
RUN echo "📂 Contenido final en /app antes del build:" && ls -la /app && ls -la /app/src || true

# ✅ Compilar el proyecto NestJS
RUN npm run build

# ========================
# 🚀 Etapa 2: Runtime
# ========================
FROM node:20-alpine AS production
WORKDIR /app

# ✅ Copiar archivos necesarios desde la etapa anterior
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# ✅ Ejecutar Prisma y luego iniciar la app
CMD npx prisma generate && node dist/src/main.js
