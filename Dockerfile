FROM node:20 AS builder
WORKDIR /app

# Copiar archivos base
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig.json ./
COPY tsconfig.build.json ./

RUN echo "📦 Archivos copiados en /app:" && ls -la /app

RUN npm install
COPY . .

RUN echo "📂 Contenido final en /app antes del build:" && ls -la /app
RUN npm run build
