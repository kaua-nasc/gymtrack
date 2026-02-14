# --- Stage 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copia arquivos de dependência
COPY package.json package-lock.json ./

# Instala todas as dependências (incluindo devDependencies para o build)
RUN npm ci

COPY . .

# Builda o projeto
RUN npm run build

# Opcional: Remove devDependencies para deixar a imagem leve
RUN npm prune --production

# --- Stage 2: Production ---
FROM node:20-slim AS production

WORKDIR /usr/src/app

# Copia apenas o necessário do estágio anterior
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./
# Se precisar do tsconfig paths, copie o original ou o de prod
COPY tsconfig.json ./ 

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Se você compilou para JS, geralmente não precisa de ts-node/tsconfig-paths no runtime
# a menos que esteja usando "absolute paths" sem transpilar os caminhos.
CMD ["node", "-r", "tsconfig-paths/register", "dist/main.js"]