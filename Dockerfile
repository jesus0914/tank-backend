# Etapa 1: Construcción (Builder)
# Usar Node 20 para compatibilidad con NestJS
FROM node:20-alpine AS builder
WORKDIR /app

# 1. Copiar archivos de dependencias y el schema.prisma
COPY package*.json ./
COPY prisma/ ./prisma/ 

# 2. Instalar dependencias (incluyendo devDependencies para el build) y generar el cliente de Prisma
# CRÍTICO: Añadir herramientas de compilación. Esto resuelve fallos en 'npm install' en Alpine 
# cuando se encuentran dependencias nativas (como a veces ocurre con 'mqtt' o utilidades).
RUN apk add --no-cache python3 make g++ 
RUN npm install
COPY . .

# CRÍTICO: La ejecución de 'nest build' falla en Alpine por problemas de PATH.
# Ejecutaremos el binario directamente desde su ubicación en node_modules.
# Esta es la forma más robusta y debe funcionar si 'npm install' tuvo éxito.
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
# CRÍTICO: CMD para usar el path completo a dist/src/main.js
CMD ["node", "dist/src/main.js"]
