# Etapa 1: build
FROM node:20 AS builder
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Compilar el proyecto
RUN npm run build

# Etapa 2: runtime
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD npx prisma generate && node dist/src/main.js
