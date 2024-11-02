# Etapa 1: Construir a aplicação frontend
FROM node:14 AS build

# Define o diretório de trabalho
WORKDIR /app

# Copie os arquivos do frontend
COPY ./package.json ./
COPY ./package-lock.json ./ 
COPY ./public ./public
COPY ./src ./src
RUN npm install
RUN npm run build

# Copie todo o código do frontend
# COPY ./ ./
# RUN npm #run build

# Etapa 2: Servir a aplicação frontend
FROM nginx:alpine

# Copie os arquivos da build do frontend para o diretório do nginx
COPY --from=build /app/build /usr/share/nginx/html

# Exponha a porta que o Nginx irá usar
EXPOSE 80

# Comando padrão para rodar o Nginx
CMD ["nginx", "-g", "daemon off;"]
