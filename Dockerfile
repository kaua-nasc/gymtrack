# --- Stage 1: Build (Bun) ---
FROM oven/bun:1 AS builder
WORKDIR /usr/src/app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# --- Stage 2: Production (Node) ---
FROM node:24-slim AS production
WORKDIR /usr/src/app

# Copia arquivos de configuração e dependências
COPY package.json ./
# Copia o tsconfig de produção que criamos
COPY tsconfig.prod.json ./tsconfig.json 
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

ENV NODE_ENV=production
# Define a variável para o tsconfig-paths encontrar o arquivo
ENV TS_NODE_PROJECT=tsconfig.json

EXPOSE 8080

# Executa usando o registro do tsconfig-paths
CMD ["node", "-r", "tsconfig-paths/register", "dist/main.js"]