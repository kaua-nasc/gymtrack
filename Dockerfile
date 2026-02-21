# --- Stage 1: Build ---
FROM oven/bun:1-alpine AS builder

WORKDIR /usr/src/app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Remove dependências de desenvolvimento para economizar centenas de MBs
RUN rm -rf node_modules && bun install --production --frozen-lockfile

# --- Stage 2: Production ---
FROM oven/bun:1-distroless AS production

WORKDIR /usr/src/app

# Copiamos apenas o necessário. 
# O Bun Distroless não tem shell nem gerenciadores de pacotes, apenas o runtime do Bun.
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# No distroless, chamamos o binário do bun diretamente
# Em vez de "bun run start:prod", chamamos o comando que o script executaria
CMD ["./node_modules/.bin/bun", "dist/src/main.js"]