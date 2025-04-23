# 🔨 Etapa 1: Compilación del frontend
FROM node:8.17.0 AS builder

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

# 🌐 Etapa 2: Servidor NGINX de producción
FROM nginx:alpine

# Copia los archivos construidos desde la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia la plantilla de NGINX que usará variables de entorno
COPY nginx.conf.template /etc/nginx/nginx.conf.template

# Copia el entrypoint que hace el reemplazo de variables
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
