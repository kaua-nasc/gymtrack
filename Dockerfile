# --- Stage 1: Build ---
FROM node:22-alpine AS builder
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Stage 2: Production ---
FROM node:22-slim AS production
WORKDIR /usr/src/app

# Copia arquivos de definição
COPY package.json package-lock.json tsconfig.json ./

# Instala apenas o necessário para rodar (omitindo dev)
# Adicionamos o tsconfig-paths explicitamente caso ele não esteja no dependencies
RUN npm ci --omit=dev && npm install tsconfig-paths --omit=dev

# Copia o código compilado do Stage 1
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 80

# CAMINHO CORRIGIDO: dist/src/main.js
# Isso vai listar os arquivos e tentar rodar, mostrando qualquer erro de "file not found"
# CMD sh -c "echo 'Conteudo da pasta dist:' && ls -R dist && node -r tsconfig-paths/register dist/src/main.js"
CMD ["node", "-r", "tsconfig-paths/register", "dist/src/main.js"]