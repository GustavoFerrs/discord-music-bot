
# Discord Music Trigger Bot

Toca **uma música automaticamente** quando **um usuário específico** entra em um canal de voz no Discord.

## Requisitos
- Node.js 18+
- FFmpeg instalado no sistema (necessário para tocar áudio)
  - **Ubuntu/Debian**: `sudo apt-get install ffmpeg`
  - **Windows (chocolatey)**: `choco install ffmpeg`
  - **macOS (Homebrew)**: `brew install ffmpeg`

## Como configurar

1. Crie um bot no [Discord Developer Portal](https://discord.com/developers/applications).
   - Adicione o bot em **Bot → Add Bot**.
   - Ative **PRESENCE INTENT** e **SERVER MEMBERS INTENT**.
   - Copie o **Token** do bot.

2. Convide o bot para o servidor via **OAuth2 → URL Generator**.
   - Marque `bot` e dê permissões mínimas: *View Channels*, *Connect*, *Speak*.
   - Adicione a URL gerada no navegador e autorize.

3. Baixe este projeto e dentro da pasta rode:
   ```bash
   npm install
   ```

4. Crie um arquivo `.env` na raiz com:
   ```env
   DISCORD_TOKEN=SEU_TOKEN_AQUI
   USER_ID_ALVO=ID_DO_USUARIO_ALVO
   MUSICA_URL=PATH_DO_ARQUIVO/ARQUIVO.MP3
   ```

   - Para pegar o **ID do usuário**, ative o **Modo Desenvolvedor** no Discord (Configurações → Avançado), clique com o botão direito no usuário e **Copiar ID**.

5. Inicie:
   ```bash
   npm start
   ```

## Como funciona
- O bot monitora `voiceStateUpdate`.
- Se o `USER_ID_ALVO` **entrou em um canal** (não estava em voz antes), o bot:
  1. Entra no mesmo canal
  2. Toca `MUSICA_URL`
  3. Sai quando a música termina

## Dicas
- Quer usar **arquivo MP3 local**?
  - Substitua a parte do `play.stream(MUSICA_URL)` por:
    ```js
    import { createReadStream } from 'fs';
    const resource = createAudioResource(createReadStream('./entrada.mp3'));
    ```
- Evite spam: não defina para tocar repetidamente em toda mudança de canal. O código já previne isso.

## Troubleshooting
- **ERRO: Unable to find ffmpeg** → Instale o FFmpeg (veja Requisitos).
- **O bot não entra no canal** → Verifique permissões do bot no servidor/canal.
- **Token inválido** → Confira se o `DISCORD_TOKEN` está correto no `.env`.

Feito com ❤️ para automações rápidas.
