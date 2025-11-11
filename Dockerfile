# Etapa 1: Construcción (Builder)
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk update && apk add python3 make g++
COPY package*.json ./
COPY prisma/ ./prisma/
RUN npm install
COPY . .
RUN /app/node_modules/.bin/nest build

# Etapa 2: Producción
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

# ✅ Copiar las imágenes ANTES del prisma (para asegurarnos que se copien)
COPY --from=builder /app/uploads ./uploads

COPY prisma/ ./prisma/
RUN apk update && apk add openssl
RUN npx prisma generate

EXPOSE 3000
CMD ["node", "dist/src/main.js"]
