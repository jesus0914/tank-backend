# Etapa 1: build
FROM node:20 as builder
WORKDIR /app

# Copiamos los archivos de dependencias
COPY package*.json ./
RUN npm install

# Copiamos todo el código
COPY . .

# Generamos Prisma Client usando variables del entorno (Railway las inyecta)
RUN npx prisma generate

# Compilamos el proyecto
RUN npm run build


# Etapa 2: runtime (más liviano)
FROM node:20-alpine as production
WORKDIR /app

# Copiamos los artefactos de la build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Expone el puerto
EXPOSE 3000

# Comando de inicio
CMD ["node", "dist/src/main.js"]
