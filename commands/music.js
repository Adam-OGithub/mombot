"use strict";
const ytdl = require(`../node_modules/ytdl-core`);
const fStatic = require("ffmpeg-static");
const { tryFail, sMsg, errmsg } = require("../custom_nodemods/utils.js");
const queue = new Map();
const play = (guildid, song) => {
  const serverQueue = queue.get(guildid);
  const dispatcher = serverQueue.connection
    .play(
      ytdl(song.url, {
        filter: "audioonly",
        type: "opus",
        audioQuality: "highestaudio",
      })
    )
    .on("error", (err) => {
      return errmsg(err);
    });
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`🎵 Playing: **${song.title}**`);
};

const getSong = (info) => {
  const vD = info?.videoDetails;
  const song = {
    title: vD?.title,
    url: vD?.video_url,
    license: vD?.media?.license,
    uploadDate: vD?.uploadDate,
    views: vD?.viewCount,
    category: vD?.category,
  };
  return song;
};

exports.run = async (client, msg, args, discord, infoObj) => {
  try {
    //
    const serverQueue = queue.get(infoObj.guildID);
    const arg = args[1];

    //If no queue exists go through process of creating one
    const voiceChannel = msg.member.voice.channel;
    const url = args[2];
    if (!voiceChannel) {
      sMsg(
        msg.channel,
        "Honey, Momma ain't gunna play you music if you do not want to hear it.So get your rear in a voice channel."
      );
    } else {
      if (arg === "play" && serverQueue === undefined) {
        const info = await ytdl.getInfo(url);
        const song = getSong(info);
        const queueContruct = {
          textChannel: msg.channel,
          voiceChannel: voiceChannel,
          connection: null,
          songs: [],
          volume: 5,
          playing: true,
        };
        queueContruct.songs.push(song);
        const connection = await voiceChannel.join();
        queueContruct.connection = connection;
        queue.set(infoObj.guildID, queueContruct);
        play(infoObj.guildID, queueContruct.songs[0]);
      } else if (arg === "skip" && serverQueue !== undefined) {
        serverQueue.connection.dispatcher.end();
        serverQueue.songs.shift();
        play(infoObj.guildID, serverQueue.songs[0]);
      } else if (arg === "stop" && serverQueue !== undefined) {
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
        serverQueue.voiceChannel.leave();
        queue.delete(infoObj.guildID);
      } else if (arg === "add" && serverQueue !== undefined) {
        const info = await ytdl.getInfo(url);
        const song = getSong(info);
        serverQueue.songs.push(song);
      }
    }
  } catch (e) {
    serverQueue.voiceChannel.leave();
    queue.delete(infoObj.guildID);
    tryFail(msg.channel, e);
  }
};
