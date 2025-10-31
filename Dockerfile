# Etapa 1: build
FROM node:20 as builder
WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm install

# Copiamos el resto del código
COPY . .

# Compilamos el proyecto (no generamos prisma aquí)
RUN npm run build


# Etapa 2: runtime
FROM node:20-alpine as production
WORKDIR /app

# Copiamos artefactos necesarios
COPY --from=builder /app/package*.json ./            
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# 👉 Generamos Prisma Client ya con DATABASE_URL del entorno (Railway la tiene ahora)
CMD npx prisma generate && node dist/src/main.js
