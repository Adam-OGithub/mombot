"use strict";
const { Permissions } = require("discord.js");
const pp = Permissions;
const perms = {
  createInv: { id: pp.FLAGS.CREATE_INSTANT_INVITE, hName: "createInv" },
  kick: { id: pp.FLAGS.KICK_MEMBERS, hName: "kick" },
  ban: { id: pp.FLAGS.BAN_MEMBERS, hName: "ban" },
  admin: { id: pp.FLAGS.ADMINISTRATOR, hName: "admin" },
  channel: { id: pp.FLAGS.MANAGE_CHANNELS, hName: "channel" },
  guild: { id: pp.FLAGS.MANAGE_GUILD, hName: "guild" },
  reactions: { id: pp.FLAGS.ADD_REACTIONS, hName: "reactions" },
  audit: { id: pp.FLAGS.VIEW_AUDIT_LOG, hName: "audit" },
  topSpeaker: { id: pp.FLAGS.PRIORITY_SPEAKER, hName: "topSpeaker" },
  stream: { id: pp.FLAGS.STREAM, hName: "stream" },
  view: { id: pp.FLAGS.VIEW_CHANNEL, hName: "view" },
  sendMsg: { id: pp.FLAGS.SEND_MESSAGES, hName: "sendMsg" },
  sendTTS: { id: pp.FLAGS.SEND_TTS_MESSAGES, hName: "sendTTS" },
  delMsg: { id: pp.FLAGS.MANAGE_MESSAGES, hName: "delMsg" },
  embedLink: { id: pp.FLAGS.EMBED_LINKS, hName: "embedLink" },
  addFile: { id: pp.FLAGS.ATTACH_FILES, hName: "addFile" },
  msgHist: { id: pp.FLAGS.READ_MESSAGE_HISTORY, hName: "msgHist" },
  mentionAll: { id: pp.FLAGS.MENTION_EVERYONE, hName: "mentionAll" },
  exEmoji: { id: pp.FLAGS.USE_EXTERNAL_EMOJIS, hName: "exEmoji" },
  guildInsight: { id: pp.FLAGS.VIEW_GUILD_INSIGHTS, hName: "guildInsight" },
  conVoice: { id: pp.FLAGS.CONNECT, hName: "conVoice" },
  speak: { id: pp.FLAGS.SPEAK, hName: "speak" },
  mute: { id: pp.FLAGS.MUTE_MEMBERS, hName: "mute" },
  deaf: { id: pp.FLAGS.DEAFEN_MEMBERS, hName: "deaf" },
  move: { id: pp.FLAGS.MOVE_MEMBERS, hName: "move" },
  voiceActive: { id: pp.FLAGS.USE_VAD, hName: "voiceActive" },
  nickname: { id: pp.FLAGS.CHANGE_NICKNAME, hName: "nickname" },
  otherNick: { id: pp.FLAGS.MANAGE_NICKNAMES, hName: "otherNick" },
  roles: { id: pp.FLAGS.MANAGE_ROLES, hName: "roles" },
  webhook: { id: pp.FLAGS.MANAGE_WEBHOOKS, hName: "webhook" },
  emojis: { id: pp.FLAGS.MANAGE_EMOJIS_AND_STICKERS, hName: "emojis" },
  appCmd: { id: pp.FLAGS.USE_APPLICATION_COMMANDS, hName: "appCmd" },
  reqSpeak: { id: pp.FLAGS.REQUEST_TO_SPEAK, hName: "reqSpeak" },
  manEvents: { id: pp.FLAGS.MANAGE_EVENTS, hName: "manEvents" },
  manThreads: { id: pp.FLAGS.MANAGE_THREADS, hName: "manThreads" },
  createPubThread: {
    id: pp.FLAGS.CREATE_PUBLIC_THREADS,
    hName: "createPubThread",
  },
  createPrivThread: {
    id: pp.FLAGS.CREATE_PRIVATE_THREADS,
    hName: "createPrivThread",
  },
  exSticker: { id: pp.FLAGS.USE_EXTERNAL_STICKERS, hName: "exSticker" },
  sendThread: { id: pp.FLAGS.SEND_MESSAGES_IN_THREADS, hName: "sendThread" },
  startEmbed: { id: pp.FLAGS.START_EMBEDDED_ACTIVITIES, hName: "startEmbed" },
  modMem: { id: pp.FLAGS.MODERATE_MEMBERS, hName: "modMem" },
};

const getRoles = async (guildObj, userid) => {
  const obj = {};
  const user = await guildObj.members.fetch(userid);
  obj.roles = user._roles;
  obj.guildRoles = user.guild.roles.cache;
  return obj;
};

//Takes current message and roles array and perms array
//checkroles output
// {
//   default: false,
//   'rolleid_name': { admin: true, kick: true },
//   'rolleid_name': { admin: true, kick: true }
// }
const checkRoles = (msg, roles, perms) => {
  const cache = msg.guild.roles.cache;
  const obj = {
    default: false,
  };
  const inObj = {};
  if (roles > 0) {
    obj.default = true;
  }

  roles.forEach((role) => {
    let roleCheck = cache.get(role);
    //check all perms on that role to see if ithas it
    perms.forEach((perm) => {
      if (roleCheck.permissions.has(perm.id)) {
        inObj[`${perm.hName}`] = true;
        obj[`${role}_${roleCheck.name}`] = inObj;
      } else {
        inObj[`${perm.hName}`] = false;
        obj[`${role}_${roleCheck.name}`] = inObj;
      }
    });
  });
  return obj;
};
exports.perms = perms;
exports.getRoles = getRoles;
exports.checkRoles = checkRoles;
