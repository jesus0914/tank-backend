# ========================
# 🏗️ Etapa 1: Build
# ========================
FROM node:20 AS builder
WORKDIR /app

# Copiar explícitamente los archivos base
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
COPY ./nest-cli.json ./nest-cli.json
COPY ./tsconfig.json ./tsconfig.json
COPY ./tsconfig.build.json ./tsconfig.build.json

# Verificar si los archivos existen
RUN echo "📦 Archivos copiados:" && ls -la /app

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Compilar el proyecto (NestJS)
RUN npm run build
