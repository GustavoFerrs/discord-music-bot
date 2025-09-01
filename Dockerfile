# Imagem base do Node
FROM node:20-alpine

# Instalar FFmpeg
RUN apk add --no-cache ffmpeg

# Criar diretório de trabalho
WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm install --only=production

# Copiar código do bot
COPY . .

# Expor a porta (se precisar, geralmente não para bots)
# EXPOSE 3000

# Comando para iniciar o bot
CMD ["node", "bot.js"]
