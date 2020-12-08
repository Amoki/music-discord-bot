const config = require('../config');
const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require('ytdl-core');
const fastq = require('fastq')

client.login(config.token);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

const youtubeRegex = /^(https?\:\/\/)?((www\.)?youtube\.com|youtu\.?be)\/.+$/;

let currentVoiceConnection;
let currentDispatcher;
let currentTask;

const queue = fastq(function(task, callback) {
  console.log(`Playing ${task.url}`)
  currentTask = task;
  currentTask.callback = callback;
  if (currentVoiceConnection) {
    currentDispatcher = currentVoiceConnection.play(ytdl(task.url, {
      filter: 'audioonly',
      volume: 0.5,
    }));
    currentDispatcher.on('finish', callback);
  }
}, 1);



client.on('message', async message => {
  // Voice only works in guilds, if the message does not come from a guild,
  // we ignore it
  if (!message.guild) return;

  if (message.content === '/join') {
    // Only try to join the sender's voice channel if they are in one themselves
    if (message.member.voice.channel) {
      console.log(`Joining ${message.member.voice.channel}`)
      message.reply("j'arrive Chef !");
      currentVoiceConnection = await message.member.voice.channel.join();
    } else {
      console.log('You need to join a voice channel first!')
      message.reply('You need to join a voice channel first!');
    }
  }
  if (currentVoiceConnection) {
    if (message.content.match(youtubeRegex)) {
      console.log(`Queueing ${message.content}`)
      queue.push({url: message.content});
    }
    if (currentDispatcher) {
      if(message.content === '/stop') {
        console.log('Stopping music')
        queue.kill();
        currentTask.callback();
        currentDispatcher.destroy();
      }
      if(message.content === '/next') {
        if (queue.length() > 1) {
          console.log('playing next music')
          currentTask.callback();
        } else {
          message.reply("il n'y a pas de musiques après, déso");
        }
      }
    }
  }
});
