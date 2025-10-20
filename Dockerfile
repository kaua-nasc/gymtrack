FROM node:lts-alpine

# Ambiente
ENV NODE_ENV=production

# Diretório de trabalho
WORKDIR /usr/src/app

# Copiar package.json e lock
COPY package*.json ./

# Instalar dependências
RUN npm install --production --silent

# Copiar todo o restante do projeto
COPY . .

# Expor porta
EXPOSE 3000

# Ajustar permissões
RUN chown -R node:node /usr/src/app
USER node

# Comando de start
CMD ["npm", "run", "start:prod"]
