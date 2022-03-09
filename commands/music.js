"use strict";
const ytdl = require(`../node_modules/ytdl-core`);
const fT = require("ffmpeg-static");
const fs = require("fs");
const {
  errHandler,
  sMsg,
  makeEmbed,
  getPre,
} = require("../custom_nodemods/utils.js");
const queue = new Map();

const embedFormat = (song, custom = "Playing song..") => {
  const embed = makeEmbed(
    `**${song.title}**`,
    `🎵 🎵 ***${custom}*** 🎵 🎵 \n `,
    undefined,
    song.url
  );
  return embed;
};
const play = async (guildid, song, msg, infoObj) => {
  try {
    const serverQueue = queue.get(guildid);
    const download = `./musicbuffer/${guildid}_1.mp4`;

    await ytdl(song.url, {
      filter: "audioonly",
      type: "opus",
      audioQuality: "highestaudio",
    }).pipe(fs.createWriteStream(download));
    //timeout to make sute file has written full to OS
    setTimeout(() => {
      const dispatcher = serverQueue.connection
        .play(download)
        .on("finish", () => {
          serverQueue.lastsong = serverQueue.songs[0];
          serverQueue.songs.shift();
          if (serverQueue.songs.length === 0) {
            sMsg(serverQueue.textChannel, `No songs in queue mom is leaving.`);
            serverQueue.voiceChannel.leave();
            queue.delete(serverQueue.guild);
          } else {
            play(serverQueue.guild, serverQueue.songs[0]);
          }
        })
        .on("error", (err) => {
          console.log(err);
          if (err.code === `ECONNRESET`) {
            serverQueue.songs.shift();
            if (serverQueue.songs.length === 0) {
              sMsg(
                serverQueue.textChannel,
                `No songs in queue mom is leaving.`
              );
              serverQueue.voiceChannel.leave();
              queue.delete(serverQueue.guild);
            } else {
              play(serverQueue.guild, serverQueue.songs[0]);
            }
          } else {
            stopMom(serverQueue, infoObj);
            errHandler(err, infoObj);
          }
        });

      dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
      const embed = embedFormat(serverQueue.songs[0], `Now Playing...`);
      serverQueue.currentsong = serverQueue.songs[0];
      serverQueue.textChannel.send(embed);
      if (msg !== undefined) {
        //msg.delete();
      }
    }, 2000);
  } catch (e) {
    //nothing
    errHandler(e, infoObj);
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

const stopMom = (serverQueue, infoObj) => {
  try {
    serverQueue.voiceChannel.leave();
    serverQueue.songs = [];
    queue.delete(serverQueue.guild);
    serverQueue.connection.dispatcher.end();
  } catch (e) {
    errHandler(e, infoObj);
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
          lastsong: null,
          currentsong: null,
        };
        queueContruct.songs.push(song);
        const connection = await voiceChannel.join();
        queueContruct.connection = connection;
        queue.set(infoObj.guildID, queueContruct);
        play(infoObj.guildID, queueContruct.songs[0], msg, infoObj);
      } else if (arg === "skip" && serverQueue !== undefined) {
        serverQueue.connection.dispatcher.end();
        serverQueue.songs.shift();
        if (serverQueue.songs.length === 0) {
          sMsg(msg.channel, `No songs in queue mom is leaving.`);
          stopMom(serverQueue, infoObj);
        } else {
          play(infoObj.guildID, serverQueue.songs[0], infoObj);
        }
      } else if (arg === "stop" && serverQueue !== undefined) {
        stopMom(serverQueue, infoObj);
      } else if (arg === "add" && serverQueue !== undefined) {
        const info = await ytdl.getInfo(url);
        const song = getSong(info);
        serverQueue.songs.push(song);
        const embed = embedFormat(song, `Added to queue!`);
        sMsg(msg.channel, embed);
        //msg.delete();
      } else if (arg === "repeat" && serverQueue !== undefined) {
        serverQueue.songs.unshift(serverQueue.currentsong);
        const embed = embedFormat(
          serverQueue.currentsong,
          `Repeat added to queue!`
        );
        sMsg(msg.channel, embed);
      } else {
        sMsg(msg.channel, `Must use play before ${arg} ${getPre()}help music `);
      }
    }
  } catch (e) {
    const eSplit = e.toString().toLowerCase().split(" ");
    if (eSplit.includes("no") && eSplit.includes("video")) {
      sMsg(msg.channel, `No video id found`);
    } else if (eSplit.includes("not") && eSplit.includes("youtube")) {
      sMsg(msg.channel, `Not a Youtube domain`);
    } else {
      errHandler(e, infoObj, true, msg.channel);
    }
  }
};
