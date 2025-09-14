# Imagem base do Node
FROM node:20-alpine

# Instalar FFmpeg
RUN apk add --no-cache ffmpeg

# Criar diretório de trabalho
WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm install

# Copiar código do projeto
COPY . .

# Expor a porta do backend
EXPOSE 3000

# Comando para iniciar bot + backend
CMD ["node", "bot.js"]