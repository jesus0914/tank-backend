# ===============================
# Etapa 1: Builder (compila NestJS)
# ===============================
FROM node:20 AS builder

# Define el directorio de trabajo
WORKDIR /app

# Copia los archivos base del proyecto
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia todo el código fuente
COPY . .

# Copiamos el archivo .env para que Prisma tenga las variables al generar el cliente
# COPY .env .env

# Generamos el cliente de Prisma (usa DATABASE_URL del .env)
RUN npx prisma generate

# Compilamos el proyecto NestJS a JavaScript
RUN npm run build


# ===============================
# Etapa 2: Producción
# ===============================
FROM node:20-alpine AS production

WORKDIR /app

# Copiamos solo lo necesario desde la etapa anterior
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/.env .env

# Variables de entorno por defecto (por si falta algo)
ENV NODE_ENV=production

# Expone el puerto del backend
EXPOSE 3000

# Comando de inicio (NestJS compilado)
CMD ["node", "dist/src/main.js"]
