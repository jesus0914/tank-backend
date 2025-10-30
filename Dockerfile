# ===============================
# Etapa 1: Builder (compila Nest y genera Prisma)
# ===============================
FROM node:20 AS builder

WORKDIR /app

# Copiamos los archivos base
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos todo el código
COPY . .

# ⚙️ Copiamos el .env si existe (solo útil en entorno local)
# Railway ignorará esto automáticamente
COPY .env .env

# Generamos el cliente de Prisma (usa DATABASE_URL del entorno o del .env)
RUN npx prisma generate

# Compilamos NestJS a JavaScript
RUN npm run build


# ===============================
# Etapa 2: Producción (imagen final ligera)
# ===============================
FROM node:20-alpine AS production

WORKDIR /app

# Copiamos solo lo necesario desde la etapa anterior
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Copiamos el .env si existe localmente (Railway lo ignorará)
COPY --from=builder /app/.env .env

# Establecemos el entorno de producción
ENV NODE_ENV=production

# Exponemos el puerto
EXPOSE 3000

# ⚡ Prisma se regenera usando las variables de entorno de Railway o .env
CMD npx prisma generate && node dist/src/main.js
