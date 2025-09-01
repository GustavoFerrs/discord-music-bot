# 🎵 Discord Music Bot por Usuário

Um bot para Discord que toca músicas diferentes para usuários específicos quando eles entram em canais de voz. Suporta arquivos locais e links do YouTube.

---

## **📋 Funcionalidades**

* Detecta quando usuários específicos entram em canais de voz.
* Toca **uma música personalizada para cada usuário**.
* Suporte a **arquivos locais**.
* Mantém logs de reprodução e erros.
* Compatível com **VPS e Docker** para rodar 24/7.

---

## **⚙️ Pré-requisitos**

* Node.js >= 20
* npm
* FFmpeg instalado e configurado
* Token de bot do Discord
* Canal de voz no Discord

---

## **📁 Estrutura do Projeto**

```
discord-bot/
│── bot.js
│── package.json
│── package-lock.json
│── .env
│── music/
│    └── musica1.mp3
```

---

## **🛠 Configuração do .env**

Crie um arquivo `.env` na raiz do projeto:

```env
DISCORD_TOKEN=SEU_TOKEN_DO_BOT
USERS_CONFIG=[
  {"id":"123456789012345678","musica":"music/musica1.mp3"},
  {"id":"987654321098765432","musica":"music/musica2.mp3"}
]
```

* `DISCORD_TOKEN` → Token do seu bot no Discord.
* `USERS_CONFIG` → Lista de usuários com a música correspondente:

  * `id` → ID do usuário no Discord.
  * `musica` → Caminho para arquivo local ou URL do YouTube.

> **Dica:** Para encontrar o ID do usuário no Discord, ative o "Modo Desenvolvedor" e clique em “Copiar ID”.

---

## **💻 Instalação**

1. Clone o projeto:

```bash
git clone https://github.com/seu-usuario/discord-bot.git
cd discord-bot
```

2. Instale as dependências:

```bash
npm install
```

3. Configure o `.env` conforme acima.

4. Ajuste o caminho do FFmpeg no `index.js`:

```js
prism.FFmpeg.getInfo = () => ({
  command: 'C:\\ffmpeg\\bin\\ffmpeg.exe' // Windows
});
```

> No Linux (VPS):

```js
command: '/usr/bin/ffmpeg'
```

---

## **▶️ Como Rodar**

### **Modo direto**

```bash
node bot.js
```

### **Modo Docker (recomendado para VPS 24/7)**

**Dockerfile**

```dockerfile
FROM node:20-alpine
RUN apk add --no-cache ffmpeg
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
CMD ["node", "bot.js"]
```

**docker-compose.yml**

```yaml
version: '3.8'

services:
  discord-bot:
    build: .
    container_name: discord-bot
    restart: always
    env_file: .env
    volumes:
      - ./music:/app/music
```

**Comandos Docker**

```bash
docker compose build
docker compose up -d   # roda em background
docker compose logs -f # vê logs
```

> O bot vai **rodar 24/7** e reiniciar automaticamente se cair.

---

## **📝 Logs e Debug**

* Logs de reprodução e erros aparecem no terminal ou via `docker compose logs`.
* Caso o bot não toque a música:

  * Verifique se o caminho do arquivo está correto.
  * Verifique se o ID do usuário está correto.
  * Para links do YouTube, confira se o vídeo está disponível publicamente.

---

## **💡 Dicas**

* Use Docker se quiser que o bot rode 24/7 sem se preocupar com PM2 ou VPS.
* Para múltiplos bots ou serviços (site + bot), use **docker-compose** com containers separados.
* Sempre teste o bot localmente antes de subir na VPS.
