const config = require('../config');
const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require('ytdl-core');
const fastq = require('fastq');
const path = require('path');


client.login(config.token);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

const youtubeRegex = /^(https?\:\/\/)?((www\.)?youtube\.com|youtu\.?be)\/.+$/;

let currentVoiceConnection;
let currentDispatcher;
let currentTask;

const queue = fastq(function(task, callback) {
  currentTask = task;
  currentTask.callback = callback;
  if (currentVoiceConnection) {
    switch (task.service) {
      case "youtube": {
        console.log(`Playing ${task.url}`);
        currentDispatcher = currentVoiceConnection.play(ytdl(task.url, {
          filter: 'audioonly',
          volume: 0.5,
        }));
        break;
      }
      case "file": {
        console.log(`Playing file`);
        currentDispatcher = currentVoiceConnection.play(task.filePath, {
          volume: 0.5,
        });
        break;
      }
    }
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
    if (message.content === '/bimdata') {
      console.log('Queueing BIMData music!');
      queue.push({filePath: path.join(__dirname, '../files/BIMDATA.mp3'), service: "file"});
    }
    if (message.content.match(youtubeRegex)) {
      console.log(`Queueing ${message.content}`)
      queue.push({url: message.content, service: "youtube"});
    }
    if (currentDispatcher) {
      if(message.content === '/stop') {
        console.log('Stopping music');
        queue.kill();
        currentTask.callback();
        currentDispatcher.destroy();
      }
      if(message.content === '/next') {
        if (queue.length() > 0) {
          console.log('playing next music');
          currentDispatcher.destroy();
          currentTask.callback();
        } else {
          message.reply("il n'y a pas de musiques après, déso");
        }
      }
    }
  }
});
