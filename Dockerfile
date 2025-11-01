# # Etapa 1: Build
# FROM node:20-alpine AS builder
# WORKDIR /app
# COPY package*.json ./
# RUN npm install       # ← instala también devDependencies
# COPY . .
# RUN npx nest build     # 👈 usa npx para construir

# # Etapa 2: Runtime
# FROM node:20-alpine
# WORKDIR /app
# COPY --from=builder /app/dist ./dist
# COPY package*.json ./
# RUN npm install --omit=dev
# EXPOSE 3000
# CMD ["node", "dist/src/main.js"]
# Etapa 1: Construcción (Builder)
# Usar Node 20 para compatibilidad con NestJS
FROM node:20-alpine AS builder
WORKDIR /app

# 1. Copiar archivos de dependencias y el schema.prisma
COPY package*.json ./
COPY prisma/ ./prisma/ 

# 2. Instalar dependencias (incluyendo devDependencies para el build) y generar el cliente de Prisma
RUN npm install
COPY . .

# CRÍTICO: Ejecutar el binario directamente desde node_modules/.bin
RUN ./node_modules/.bin/nest build

# Etapa 2: Producción (Production)
FROM node:20-alpine
WORKDIR /app

# 1. Copiar archivos para dependencias de producción
COPY package*.json ./

# 2. Instalar solo dependencias de producción
RUN npm install --omit=dev 

# 3. Copiar el código compilado (dist)
COPY --from=builder /app/dist ./dist

# 4. COPIAR EL CLIENTE DE PRISMA YA GENERADO Y SUS BINARIOS
# Esto permite que la aplicación use Prisma sin tener que instalar todas las herramientas de desarrollo.
COPY --from=builder /app/node_modules/.prisma/client/ ./node_modules/.prisma/client/ 
COPY --from=builder /app/node_modules/@prisma/client/ ./node_modules/@prisma/client/

# Instalar dependencias SSL necesarias para conectar a PostgreSQL desde Alpine
RUN apk update && apk add openssl
EXPOSE 3000
CMD ["node", "dist/main.js"]
