# ========================
# 🏗️ Etapa 1: Build
# ========================
FROM node:20 AS builder
WORKDIR /app

# ✅ Copiar explícitamente los archivos base
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
COPY ./nest-cli.json ./nest-cli.json
COPY ./tsconfig.json ./tsconfig.json
COPY ./tsconfig.build.json ./tsconfig.build.json

# ✅ Mostrar lo que se copió
RUN echo "📦 Archivos copiados en /app:" && ls -la /app

# ✅ Instalar dependencias
RUN npm install

# ✅ Copiar el resto del código fuente
COPY . .

# ✅ Mostrar contenido antes del build
RUN echo "📂 Contenido final antes del build:" && ls -la /app && ls -la /app/src || true

# ✅ Compilar NestJS
RUN npm run build

# ========================
# 🚀 Etapa 2: Runtime
# ========================
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD npx prisma generate && node dist/src/main.js
