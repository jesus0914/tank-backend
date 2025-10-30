# ===============================
# Etapa 1: Builder (compila NestJS)
# ===============================
FROM node:20 AS builder

# Directorio de trabajo
WORKDIR /app

# Copiar archivos base
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# ⚠️ NO ejecutar prisma generate aquí, Railway no tiene las env en build
# RUN npx prisma generate

# Compilar el proyecto NestJS
RUN npm run build


# ===============================
# Etapa 2: Producción
# ===============================
FROM node:20-alpine AS production

WORKDIR /app

# Copiar solo lo necesario desde el builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Definir entorno
ENV NODE_ENV=production

# Exponer puerto de NestJS
EXPOSE 3000

# ⚡ Ejecutar prisma generate en runtime (ya con DATABASE_URL disponible)
CMD npx prisma generate && node dist/src/main.js
