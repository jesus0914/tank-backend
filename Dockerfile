# Etapa 1: Construcción (Builder)
FROM node:20-alpine AS builder
WORKDIR /app

# 1. Instalar herramientas de compilación de Alpine necesarias para dependencias nativas
RUN apk update && apk add python3 make g++

# 2. Copiar archivos de dependencias y el schema.prisma
COPY package*.json ./
COPY prisma/ ./prisma/

# 3. Instalar dependencias completas (incluyendo devDependencies para el build)
RUN npm install
COPY . .

# 4. CRÍTICO: Ejecutar el build de NestJS
RUN /app/node_modules/.bin/nest build


# Etapa 2: Producción (Production)
FROM node:20-alpine
WORKDIR /app

# 1. Copiar archivos para dependencias de producción
COPY package*.json ./

# 2. Instalar solo dependencias de producción
RUN npm install --omit=dev

# 3. Copiar el código compilado (dist)
COPY --from=builder /app/dist ./dist

# 4. Copiar el esquema de Prisma
COPY prisma/ ./prisma/

# ✅ 5. Copiar también las imágenes subidas
COPY --from=builder /app/uploads ./uploads

# 6. Instalar dependencias SSL para conectar a PostgreSQL desde Alpine
RUN apk update && apk add openssl

# 7. Generar cliente de Prisma
RUN npx prisma generate

EXPOSE 3000

# 8. Iniciar aplicación NestJS
CMD ["node", "dist/src/main.js"]
