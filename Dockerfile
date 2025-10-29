# Etapa 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar todo el código
COPY . .

# Construir la app NestJS
RUN npm run build

# Etapa 2: Producción
FROM node:22-alpine
WORKDIR /app

# Copiar package.json y node_modules necesarios
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copiar la carpeta dist compilada
COPY --from=builder /app/dist ./dist

# Puerto que usará NestJS
EXPOSE 3000

# Comando para iniciar la app
CMD ["node", "dist/main"]
