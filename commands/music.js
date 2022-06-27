"use strict";
const ytdl = require(`../node_modules/ytdl-core`);
const fT = require("ffmpeg-static");
const fs = require("fs");
const ytpl = require("ytpl");
const {
  joinVoiceChannel,
  createAudioResource,
  createAudioPlayer,
  StreamType,
} = require("@discordjs/voice");
const {
  errHandler,
  sMsg,
  makeEmbed,
  getPre,
  argToReg,
} = require("../custom_nodemods/utils.js");
const queue = new Map();

const embedFormat = (song, custom = "Playing song..") => {
  const embed = makeEmbed(
    `**${song?.title}**`,
    `🎵 🎵 ***${custom}*** 🎵 🎵 \n `,
    undefined,
    song?.url
  );
  return embed;
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

const play = async (guildid, song, msg, infoObj) => {
  try {
    const serverQueue = queue.get(guildid);
    const songBuff = `./musicbuffer/${guildid}.mp4`;

    await ytdl(song.url, {
      filter: "audioonly",
      type: "opus",
      audioQuality: "highestaudio",
    }).pipe(fs.createWriteStream(songBuff));
    const musicFile = createAudioResource(songBuff, {
      inlineVolume: true,
    });
    musicFile.volume.setVolume(0.5);
    const audioP = createAudioPlayer();
    audioP.play(musicFile);
  } catch (e) {
    //nothing
    errHandler(e);
  }
};

exports.run = async (client, msg, args, discord, infoObj) => {
  try {
    let arg = args[1];
    const arg2 = args[2];
    const url = arg2;
    const voiceObj = msg.member.voice.channel;
    if (arg.length >= 2) {
      arg = await argToReg(args[1], infoObj.altMusic);
    }

    if (!voiceObj) {
      sMsg(
        msg.channel,
        "Honey, Momma ain't gunna play you music if you do not want to hear it.So get your rear in a voice channel."
      );
    } else {
      const perms = voiceObj.permissionsFor(msg.client.user);
      if (!perms.has("CONNECT") || !perms.has("SPEAK")) {
        sMsg(
          msg.channel,
          "I need the permissions to join and speak in your voice channel!"
        );
      } else {
        //Passes all checks
        const reg1 = new RegExp(`[l][i][s][t][=]`);
        const reg2 = new RegExp(`[i][n][d][e][x][=]`);
        const serverQueue = queue.get(infoObj.guildID);
        const voiceChannel = {
          channelId: voiceObj.id,
          guildId: voiceObj.guild.id,
          adapterCreator: msg.guild.voiceAdapterCreator,
        };

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
        console.log(`1. queueContruct`, queueContruct);

        if (serverQueue === undefined) {
          if (arg === "play") {
            const startPlay = async () => {
              const connection = await joinVoiceChannel(voiceChannel);
              queueContruct.connection = connection;
              queue.set(infoObj.guildID, queueContruct);
              queueContruct.nextSong = queueContruct.songs[1];
              client.edit({ deafen: false, autoSelfDeaf: false });
              play(infoObj.guildID, queueContruct.songs[0], msg, infoObj);
              msg.delete();
            };

            if (reg1.test(url) && reg2.test(url) !== true) {
              const urlSplit = url.split("list=");
              const batch = await ytpl(urlSplit[1]);
              for (let i = 0; i < batch.items.length; i++) {
                let song = await getSong(batch.items[i].url);
                queueContruct.songs.push(song);
                //if play list is less than 2 songs will not play
                if (i === 1) {
                  startPlay();
                }
              }
            } else {
              //
              const song = await getSong(url);
              queueContruct.songs.push(song);
              startPlay();
            }
          }
          console.log(`2. queueContruct`, queueContruct);
        } else {
          switch (arg) {
            case "skip":
              break;
            case "stop":
              break;
            case "add":
              break;
            case "repeat":
              break;
            case "skip":
              break;
            default:
              break;
          }
        }
      }
    }
  } catch (e) {
    const eSplit = e.toString().toLowerCase().split(" ");
    if (eSplit.includes("no") && eSplit.includes("video")) {
      sMsg(msg.channel, `No video id found, please make sure it is public.`);
    } else if (eSplit.includes("not") && eSplit.includes("youtube")) {
      sMsg(msg.channel, `Not a Youtube domain`);
    } else if (
      (eSplit.includes("unknown") && eSplit.includes("playlist")) ||
      (eSplit.includes("playlist") && eSplit.includes("exist."))
    ) {
      sMsg(msg.channel, `Unable to find that playlist.`);
    } else if (eSplit.includes("unable") && eSplit.includes("id")) {
      sMsg(msg.channel, `Unable to find an id, please make sure it is public.`);
    } else {
      errHandler(e, infoObj, true, msg.channel);
    }
  }
};
