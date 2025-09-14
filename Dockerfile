FROM node:20-alpine

# Instalar dependências do sistema
RUN apk add --no-cache \
    ffmpeg \
    libsodium \
    build-base \
    make \
    g++ \
    python3

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]