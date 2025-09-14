import dotenv from "dotenv";
dotenv.config();

import { Client, GatewayIntentBits } from "discord.js";
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} from "@discordjs/voice";
import play from "play-dl";
import { createReadStream, existsSync, readFileSync } from "fs";

const TOKEN = process.env.DISCORD_TOKEN;

// Função para carregar usuários do JSON
function loadUsers() {
  try {
    return JSON.parse(readFileSync("users.json"));
  } catch {
    return [];
  }
}

if (!TOKEN) {
  console.error("❌ Configure o DISCORD_TOKEN no arquivo .env");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.once("clientReady", () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  try {
    const USERS_CONFIG = loadUsers();
    const userConfig = USERS_CONFIG.find((u) => u.id === newState?.member?.id);
    if (!userConfig) return;

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
        resource = createAudioResource(createReadStream(musica));
      } else {
        try {
          const info = await play.video_info(musica);
          const stream = await play.stream_from_info(info);
          resource = createAudioResource(stream.stream, {
            inputType: stream.type,
          });
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
        try {
          connection.destroy();
        } catch {}
      });

      player.on("error", (e) => {
        console.error(`Erro no player para ${newState.member.user.username}:`, e);
        try {
          connection.destroy();
        } catch {}
      });
    }
  } catch (err) {
    console.error("Erro ao processar voiceStateUpdate:", err);
  }
});

client.login(TOKEN).catch((err) => {
  console.error("Falha ao logar:", err);
});