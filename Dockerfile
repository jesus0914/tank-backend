# ===============================
# Etapa 1: Builder (compila NestJS)
# ===============================
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copiamos todo el código fuente
COPY . .

# Prisma usará las variables de entorno de Railway automáticamente
RUN npx prisma generate

# Compilamos NestJS
RUN npm run build

# ===============================
# Etapa 2: Producción
# ===============================
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Railway inyecta automáticamente las env vars (como DATABASE_URL)
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/src/main.js"]
