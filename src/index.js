const config = require('../config');
const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require('ytdl-core');

client.login(config.token);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

const youtubeRegex = /^(https?\:\/\/)?((www\.)?youtube\.com|youtu\.?be)\/.+$/;

let currentVoiceConnection;
let currentDispatcher;

client.on('message', async message => {
  // Voice only works in guilds, if the message does not come from a guild,
  // we ignore it
  if (!message.guild) return;

  if (message.content === '/join') {
    // Only try to join the sender's voice channel if they are in one themselves
    if (message.member.voice.channel) {
      currentVoiceConnection = await message.member.voice.channel.join();
    } else {
      console.log('You need to join a voice channel first!')
      message.reply('You need to join a voice channel first!');
    }
  }
  if (currentVoiceConnection) {
    if (message.content.match(youtubeRegex)) {
      currentDispatcher = currentVoiceConnection.play(ytdl(message.content, {
        filter: 'audioonly',
        volume: 0.5,
      }));
      currentDispatcher.setVolume(0.5);
    }
    if (currentDispatcher && message.content === '/stop') {
      currentDispatcher.destroy();
    }
  }
});
