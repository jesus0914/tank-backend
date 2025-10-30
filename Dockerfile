# Etapa 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar todo y compilar NestJS
COPY . .
RUN npm run build

# Etapa 2: Producción
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# Copiar solo la build
COPY --from=builder /app/dist ./dist

# Puerto
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
