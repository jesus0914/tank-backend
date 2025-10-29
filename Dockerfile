# Etapa 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install --frozen-lockfile

# Copiar el resto del código
COPY . .

# Construir el proyecto NestJS
RUN npm run build

# Etapa 2: Producción
FROM node:22-alpine

WORKDIR /app

# Copiar solo los archivos necesarios para producción
COPY package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Instalar solo dependencias de producción
RUN npm install --omit=dev

# Variables de entorno (Railway configurará las suyas)
ENV NODE_ENV=production
ENV PORT=3000

# Exponer el puerto
EXPOSE 3000

# Comando para arrancar la app
CMD ["node", "dist/main"]
