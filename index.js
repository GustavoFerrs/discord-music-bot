import dotenv from 'dotenv';
dotenv.config();

import prism from 'prism-media';
prism.FFmpeg.getInfo = () => ({
  command: 'C:\\ffmpeg\\bin\\ffmpeg.exe' 
});

import { Client, GatewayIntentBits } from 'discord.js';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import play from 'play-dl';
import { createReadStream, existsSync } from 'fs';

const TOKEN = process.env.DISCORD_TOKEN;
const USERS_CONFIG = JSON.parse(process.env.USERS_CONFIG || '[]');

if (!TOKEN || USERS_CONFIG.length === 0) {
  console.error('❌ Configure DISCORD_TOKEN e USERS_CONFIG no arquivo .env');
  process.exit(1);
}

// Inicializa o bot
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.once('ready', () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  try {
    const userConfig = USERS_CONFIG.find(u => u.id === newState?.member?.id);
    if (!userConfig) return; // Se o usuário não estiver na lista, ignora

    // Só dispara quando o usuário entra no canal (não quando troca)
    if (newState.channelId && !oldState.channelId) {
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
      const musica = userConfig.musica;

      if (existsSync(musica)) {
        // Arquivo local
        resource = createAudioResource(createReadStream(musica));
      } else {
        // URL do YouTube
        try {
          const info = await play.video_info(musica);
          const stream = await play.stream_from_info(info);
          resource = createAudioResource(stream.stream, { inputType: stream.type });
        } catch (err) {
          console.error(`❌ Erro ao processar URL para ${newState.member.user.username}:`, err);
          return;
        }
      }

      player.play(resource);

      player.on(AudioPlayerStatus.Playing, () => {
        console.log(`▶️ Tocando música para ${newState.member.user.username}...`);
      });

      player.on(AudioPlayerStatus.Idle, () => {
        console.log(`⏹️ Música terminou para ${newState.member.user.username}. Saindo do canal.`);
        try { connection.destroy(); } catch {}
      });

      player.on('error', (e) => {
        console.error(`Erro no player para ${newState.member.user.username}:`, e);
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
