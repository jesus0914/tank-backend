# -------------------------------------------------------
# 🏗️ Etapa 1: Compilación
# -------------------------------------------------------
FROM node:20 AS builder

# Carpeta de trabajo
WORKDIR /app

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del proyecto
COPY . .

# Generamos el cliente de Prisma (evita el error "@prisma/client did not initialize yet")
RUN npx prisma generate

# Compilamos el proyecto NestJS
RUN npm run build


# -------------------------------------------------------
# 🚀 Etapa 2: Ejecución (producción)
# -------------------------------------------------------
FROM node:20-alpine AS production

WORKDIR /app

# Copiamos solo lo necesario desde la etapa anterior
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Prisma necesita el schema para migraciones si las usas
RUN npx prisma generate

# Exponemos el puerto (ajústalo si tu app usa otro)
EXPOSE 3000

# Comando de inicio
CMD ["node", "dist/main.js"]
