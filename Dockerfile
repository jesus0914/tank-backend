# ========================
# 🏗️ Etapa 1: Build
# ========================
FROM node:20 AS builder
WORKDIR /app

# Copiar los archivos base
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./

RUN echo "=== Archivos iniciales copiados ===" && ls -la /app

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

RUN echo "=== Contenido completo de /app después de COPY . ===" && ls -la /app

# Compilar el proyecto
RUN npm run build
