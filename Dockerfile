FROM node:20-alpine

WORKDIR /app

# Instalar dependências necessárias para o Prisma no Alpine Linux
RUN apk add --no-cache \
    openssl \
    openssl-dev \
    libc6-compat \
    curl

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências de produção
RUN npm ci --only=production && npm cache clean --force

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expor porta
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Comando de inicialização
CMD ["node", "src/server.js"]
