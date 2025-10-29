# Etapa 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Construir la app NestJS
RUN npm run build

# Etapa 2: Producción
FROM node:22-alpine
WORKDIR /app

# Copiar dependencias
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copiar código compilado
COPY --from=builder /app/dist ./dist

# Exponer puerto
EXPOSE 3000

# Comando para iniciar la app
CMD ["node", "dist/main"]
