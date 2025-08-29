import dotenv from 'dotenv';
dotenv.config();

import prism from 'prism-media'; // <-- adicionado
prism.FFmpeg.getInfo = () => ({
  command: 'C:\\ffmpeg\\bin\\ffmpeg.exe' // ajuste para o caminho real
});

import { Client, GatewayIntentBits } from 'discord.js';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import play from 'play-dl';
import { createReadStream, existsSync } from 'fs';

/**
 * .env exemplo:
 * DISCORD_TOKEN=SEU_TOKEN_AQUI
 * USER_ID_ALVO=351120175707193354
 * MUSICA_URL=music/minha_musica.mp3  # ou link do YouTube
 */

const TOKEN = process.env.DISCORD_TOKEN;
const USER_ID_ALVO = process.env.USER_ID_ALVO;
const MUSICA_URL = process.env.MUSICA_URL;

if (!TOKEN || !USER_ID_ALVO || !MUSICA_URL) {
  console.error('❌ Configure DISCORD_TOKEN, USER_ID_ALVO e MUSICA_URL no arquivo .env');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.once('clientReady', () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  try {
    // Dispara apenas quando o usuário alvo entra no canal
    if (newState?.member?.id === String(USER_ID_ALVO) && newState.channelId && !oldState.channelId) {
      const canal = newState.channel;
      console.log(`🎧 ${newState.member.user.username} entrou em: ${canal.name}`);

      const connection = joinVoiceChannel({
        channelId: canal.id,
        guildId: canal.guild.id,
        adapterCreator: canal.guild.voiceAdapterCreator,
        selfDeaf: false,
      });

      const player = createAudioPlayer();
      connection.subscribe(player);

      let resource;

      console.log('MUSICA_URL:', JSON.stringify(MUSICA_URL))

      if (existsSync(MUSICA_URL)) {
        // Arquivo local
        resource = createAudioResource(createReadStream(MUSICA_URL));
      } else {
        // Link do YouTube
        try {
          const info = await play.video_info(MUSICA_URL);
          const stream = await play.stream_from_info(info);
          resource = createAudioResource(stream.stream, { inputType: stream.type });
        } catch (err) {
          console.error('❌ Erro ao processar URL do YouTube:', err);
          return;
        }
      }

      player.play(resource);

      player.on(AudioPlayerStatus.Playing, () => {
        console.log('▶️ Tocando música de entrada...');
      });

      player.on(AudioPlayerStatus.Idle, () => {
        console.log('⏹️ Música terminou. Saindo do canal.');
        try { connection.destroy(); } catch {}
      });

      player.on('error', (e) => {
        console.error('Erro no player:', e);
        try { connection.destroy(); } catch {}
      });
    }
  } catch (err) {
    console.error('Erro ao processar voiceStateUpdate:', err);
  }
});

client.login(TOKEN).catch(err => {
  console.error('Falha ao logar:', err);
});
