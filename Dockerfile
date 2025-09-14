FROM node:20-alpine

# Instalar dependências do sistema necessárias para sodium e ffmpeg
RUN apk add --no-cache \
    ffmpeg \
    libsodium-dev \
    build-base \
    make \
    g++ \
    python3

WORKDIR /app

# Copiar arquivos de dependências primeiro (para cache do Docker)
COPY package*.json ./

# Instalar dependências Node.js
RUN npm ci --only=production

# Copiar resto dos arquivos
COPY . .

EXPOSE 3000

CMD ["node", "index.js"]