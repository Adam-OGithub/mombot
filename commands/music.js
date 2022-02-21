"use strict";
const ytdl = require(`../node_modules/ytdl-core`);
const fT = require("ffmpeg-static");
const {
  tryFail,
  sMsg,
  errmsg,
  makeEmbed,
} = require("../custom_nodemods/utils.js");
const queue = new Map();

const embedFormat = (song) => {
  const embed = makeEmbed(
    `**${song.title}**`,
    `🎵 🎵 🎵 🎵 `,
    undefined,
    song.url
  );
  return embed;
};
const play = (guildid, song, msg) => {
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
          sMsg(msg.channel, `No songs in queue mom is leaving.`);
          serverQueue.voiceChannel.leave();
          queue.delete(guildid);
        } else {
          play(guildid, serverQueue.songs[0]);
          const embed = embedFormat(songs[0].song);
          serverQueue.textChannel.send(embed);
        }
      })
      .on("error", (err) => {
        console.log(err);
        // const reg = new RegExp(`[a][b][o][r][t]`);
        // const aborted = err.toLowerCase();
        // if (reg.test(aborted)) {
        //   serverQueue.songs.shift();
        //   if (serverQueue.songs.length === 0) {
        //     sMsg(msg.channel, `No songs in queue mom is leaving.`);
        //     serverQueue.voiceChannel.leave();
        //     queue.delete(guildid);
        //   } else {
        //     play(guildid, serverQueue.songs[0]);
        //   }
        // } else {
        //   stopMom(serverQueue);
        //   return errmsg(err);
        // }
      });
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    const embed = embedFormat(song);
    serverQueue.textChannel.send(embed);
    msg.delete();
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
  try {
    serverQueue.voiceChannel.leave();
    serverQueue.songs = [];
    queue.delete(serverQueue.guild);
    serverQueue.connection.dispatcher.end();
  } catch (e) {
    errmsg(e);
  }
};

exports.run = async (client, msg, args, discord, infoObj) => {
  try {
    //
    const serverQueue = queue.get(infoObj.guildID);
    const arg = args[1];
    //If no queue exists go through process of creating one
    const voiceChannel = msg.member.voice.channel;
    const perms = voiceChannel.permissionsFor(msg.client.user);
    const url = args[2];
    if (!voiceChannel) {
      sMsg(
        msg.channel,
        "Honey, Momma ain't gunna play you music if you do not want to hear it.So get your rear in a voice channel."
      );
    } else if (!perms.has("CONNECT") || !perms.has("SPEAK")) {
      sMsg(
        msg.channel,
        "I need the permissions to join and speak in your voice channel!"
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
        play(infoObj.guildID, queueContruct.songs[0], msg);
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
        const embed = embedFormat(song);
        sMsg(msg.channel, embed);
        msg.delete();
      }
    }
  } catch (e) {
    tryFail(msg.channel, e);
  }
};
