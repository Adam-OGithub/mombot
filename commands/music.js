"use strict";
const ytdl = require(`../node_modules/ytdl-core`);
const fT = require("ffmpeg-static");
const { tryFail, sMsg, errmsg } = require("../custom_nodemods/utils.js");
const queue = new Map();
const play = (guildid, song) => {
  try {
    const serverQueue = queue.get(guildid);
    const dispatcher = serverQueue.connection
      .play(
        ytdl(song.url, {
          filter: "audioonly",
          type: "opus",
          audioQuality: "highestaudio",
        })
      )
      .on("finish", () => {
        serverQueue.songs.shift();
        if (serverQueue.songs.length === 0) {
          queue.delete(guildid);
        } else {
          play(guildid, serverQueue.songs[0]);
        }
      })
      .on("error", (err) => {
        stopMom(serverQueue);
        return errmsg(err);
      });
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`🎵 Playing: **${song.title}**`);
  } catch (e) {
    //nothing
    errmsg(e);
  }
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

const stopMom = (serverQueue) => {
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
  serverQueue.voiceChannel.leave();
  queue.delete(serverQueue.guild);
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
          volume: 3,
          playing: true,
          guild: infoObj.guildID,
        };
        queueContruct.songs.push(song);
        const connection = await voiceChannel.join();
        queueContruct.connection = connection;
        queue.set(infoObj.guildID, queueContruct);
        play(infoObj.guildID, queueContruct.songs[0]);
        //removes mom from channel if queue is empty
        const checkQueue = setInterval(() => {
          if (serverQueue === undefined || serverQueue.songs.length === 0) {
            clearInterval(checkQueue);
          }
        }, 60 * 1000);
      } else if (arg === "skip" && serverQueue !== undefined) {
        serverQueue.connection.dispatcher.end();
        serverQueue.songs.shift();
        if (serverQueue.songs.length === 0) {
          sMsg(msg.channel, `No songs in queue mom is leaving.`);
          serverQueue.voiceChannel.leave();
        } else {
          play(infoObj.guildID, serverQueue.songs[0]);
        }
      } else if (arg === "stop" && serverQueue !== undefined) {
        stopMom(serverQueue);
      } else if (arg === "add" && serverQueue !== undefined) {
        const info = await ytdl.getInfo(url);
        const song = getSong(info);
        serverQueue.songs.push(song);
      }
    }
  } catch (e) {
    tryFail(msg.channel, e);
  }
};
