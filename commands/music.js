"use strict";
const ytdl = require(`../node_modules/ytdl-core`);
const fT = require("ffmpeg-static");
const fs = require("fs");
const ytpl = require("ytpl");
const {
  errHandler,
  sMsg,
  makeEmbed,
  getPre,
} = require("../custom_nodemods/utils.js");
const queue = new Map();

const embedFormat = (song, custom = "Playing song..") => {
  const embed = makeEmbed(
    `**${song?.title}**`,
    `🎵 🎵\n ***${custom}***\n `,
    undefined,
    song?.url
  );
  return embed;
};
const play = async (guildid, song, msg, infoObj) => {
  try {
    const serverQueue = queue.get(guildid);
    const songBuff = `./musicbuffer/${guildid}.mp4`;

    await ytdl(song.url, {
      filter: "audioonly",
      type: "opus",
      audioQuality: "highestaudio",
    }).pipe(fs.createWriteStream(songBuff));
    //timeout to make sure file has written full to OS
    setTimeout(() => {
      const dispatcher = serverQueue.connection
        .play(songBuff)
        .on("finish", () => {
          serverQueue.lastsong = serverQueue.songs[0];
          serverQueue.songs.shift();
          serverQueue.nextSong = serverQueue.songs[1];
          if (serverQueue.songs.length === 0) {
            sMsg(serverQueue.textChannel, `No songs in queue mom is leaving.`);
            stopMom(serverQueue);
          } else {
            play(serverQueue.guild, serverQueue.songs[0]);
          }
        })
        .on("error", (err) => {
          if (err.code === `ECONNRESET`) {
            serverQueue.songs.shift();
            if (serverQueue.songs.length === 0) {
              sMsg(
                serverQueue.textChannel,
                `No songs in queue mom is leaving.`
              );
              stopMom(serverQueue);
            } else {
              play(serverQueue.guild, serverQueue.songs[0]);
            }
          } else {
            stopMom(serverQueue);
            errHandler(err);
          }
        });
      serverQueue.dispatcher = dispatcher;
      dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

      const embed = embedFormat(serverQueue.songs[0], `Now Playing...`);
      serverQueue.currentsong = serverQueue.songs[0];
      serverQueue.textChannel.send(embed);
    }, 2000);
  } catch (e) {
    //nothing
    errHandler(e);
  }
};

const getSong = async (url) => {
  const info = await ytdl.getInfo(url);
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
    // serverQueue.connection.dispatcher.destroy();
    serverQueue.voiceChannel.leave();
    serverQueue.songs = [];
    // const file = `./musicbuffer/${serverQueue.guild}.mp4`;
    // fs.unlink(file, (e) => {
    //   if (e) {
    //     errHandler(e);
    //   }
    // });
    queue.delete(serverQueue.guild);
  } catch (e) {
    errHandler(e);
  }
};

exports.run = async (client, msg, args, discord, infoObj) => {
  try {
    //
    const serverQueue = queue.get(infoObj.guildID);
    const arg = args[1];
    const arg2 = args[2];
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
      const reg = new RegExp(`[l][i][s][t][=]`);
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
        nextSong: null,
        dispatcher: null,
      };
      if (arg === "play" && serverQueue === undefined) {
        const song = await getSong(url);
        queueContruct.songs.push(song);
        const connection = await voiceChannel.join();
        queueContruct.connection = connection;
        queue.set(infoObj.guildID, queueContruct);
        queueContruct.nextSong = queueContruct.songs[1];
        play(infoObj.guildID, queueContruct.songs[0], msg, infoObj);
        msg.delete();
      } else if (arg === "skip" && serverQueue !== undefined) {
        serverQueue.lastsong = serverQueue.songs[0];
        serverQueue.songs.shift();
        serverQueue.nextSong = serverQueue.songs[1];
        if (serverQueue.songs.length === 0) {
          sMsg(msg.channel, `No songs in queue mom is leaving.`);
          stopMom(serverQueue, infoObj);
        } else {
          play(infoObj.guildID, serverQueue.songs[0], infoObj);
        }
      } else if (arg === "stop" && serverQueue !== undefined) {
        stopMom(serverQueue, infoObj);
      } else if (arg === "add" && serverQueue !== undefined) {
        // const urlSplit = url.split("list=");
        // const batch = await ytpl(urlSplit[1]);
        // for (let i = 0; i < batch.items.length; i++) {
        //   let song = await getSong(batch.items[i].url);
        //   serverQueue.songs.push(song);
        //   if (i === 1) {
        //     msg.delete();
        //     const embed = embedFormat(song, `Playlist added to queue!`);
        //     sMsg(msg.channel, embed);
        //   }
        // }

        const song = await getSong(url);
        serverQueue.songs.push(song);
        serverQueue.nextSong = serverQueue.songs[1];
        if (song === undefined) {
          sMsg(msg.channel, "Unable to add song");
        } else {
          const embed = embedFormat(
            song,
            `Momma just slid that song right in there!`
          );
          sMsg(msg.channel, embed);
        }
        msg.delete();
      } else if (arg === "repeat" && serverQueue !== undefined) {
        serverQueue.songs.unshift(serverQueue.currentsong);
        serverQueue.nextSong = serverQueue.songs[1];
        const embed = embedFormat(
          serverQueue.currentsong,
          `Momma loves this song, so I am playing it again.`
        );
        sMsg(msg.channel, embed);
      } else if (arg === "playlist" && serverQueue === undefined) {
        if (reg.test(url)) {
          const urlSplit = url.split("list=");
          const batch = await ytpl(urlSplit[1]);
          for (let i = 0; i < batch.items.length; i++) {
            let song = await getSong(batch.items[i].url);
            queueContruct.songs.push(song);
            //if play list is less than 2 songs will not play
            if (i === 1) {
              msg.delete();
              const connection = await voiceChannel.join();
              queueContruct.connection = connection;
              queue.set(infoObj.guildID, queueContruct);
              queueContruct.nextSong = queueContruct.songs[1];
              play(infoObj.guildID, queueContruct.songs[0], msg, infoObj);
            }
          }
        } else {
          sMsg(
            msg.channel,
            `Momma is missing list= in the url, ${arg} ${getPre()}help music `
          );
        }
      } else if (arg === "queue" && serverQueue !== undefined) {
        const q = serverQueue;
        const a = `Song count: ${q.songs.length}`;
        const b = `Volume: ${q.volume}`;
        const c = `***Current song:***\nTitle: ${q.currentsong.title}\nUrl: ${q.currentsong.url}`;
        const d =
          q.nextSong === null
            ? "***Next Song:*** None"
            : `***Next Song:***\nTitle: ${q.nextSong.title}\nUrl: ${q.nextSong.url}`;
        const e =
          q.lastsong === null
            ? "***Last Song:*** None"
            : `***Last Song:***\nTitle: ${q.lastsong.title}\nUrl: ${q.lastsong.url}`;

        const info = `${a}\n${b}\n${c}\n${d}\n${e}`;
        const embed = makeEmbed("🎵_Music Queue Info_🎵", info);
        sMsg(msg.channel, embed);
      } else if (
        arg === "volume" &&
        serverQueue !== undefined &&
        arg2 !== undefined
      ) {
        if (!isNaN(arg2)) {
          if (arg2 <= 12) {
            if (serverQueue.volume === arg2) {
              const embed = makeEmbed("Momma is keeping it the same.", `‌‌ `);
              sMsg(msg.channel, embed);
            } else {
              const volumeStat = serverQueue.volume > arg2 ? `down` : `up`;
              const embed = makeEmbed(
                `Momma is turning that ${volumeStat} for you!`,
                `Volume was: ${serverQueue.volume}\nChanged to: ${arg2}`
              );
              serverQueue.volume = arg2;
              serverQueue.dispatcher.setVolumeLogarithmic(
                serverQueue.volume / 5
              );
              sMsg(msg.channel, embed);
            }
          } else {
            sMsg(
              msg.channel,
              `Momma don't want to bust those eardrums, try a volume lower or equal to 12`
            );
          }
        }
      } else {
        sMsg(
          msg.channel,
          `Looks like you need some help with the music darling, ${arg} ${getPre()}help music`
        );
      }
    }
  } catch (e) {
    const eSplit = e.toString().toLowerCase().split(" ");
    if (eSplit.includes("no") && eSplit.includes("video")) {
      sMsg(msg.channel, `No video id found, please make sure it is public.`);
    } else if (eSplit.includes("not") && eSplit.includes("youtube")) {
      sMsg(msg.channel, `Not a Youtube domain`);
    } else if (eSplit.includes("unknown") && eSplit.includes("playlist")) {
      sMsg(msg.channel, `Unable to find that playlist.`);
    } else if (eSplit.includes("unable") && eSplit.includes("id")) {
      sMsg(msg.channel, `Unable to find an id, please make sure it is public.`);
    } else {
      errHandler(e, infoObj, true, msg.channel);
    }
  }
};
