FROM node:20-alpine

# Instalar dependencias del sistema necesarias para compilar `better-sqlite3` en Alpine
RUN apk update && apk add --no-cache python3 make g++

WORKDIR /app

# Copiar configuración e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el código fuente
COPY . .

# Nos aseguramos de que el servidor empiece como el usuario Node, no root (buena práctica)
RUN mkdir -p /app/data && chown -R node:node /app/data
USER node

# Exponemos el puerto
ENV PORT=3000
EXPOSE 3000

# Iniciamos el servicio y el script the semillas
CMD ["npm", "start"]