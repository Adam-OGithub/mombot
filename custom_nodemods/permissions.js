"use strict";
const { Permissions } = require("discord.js");
const pp = Permissions;
const perms = {
  createInv: pp.FLAGS.CREATE_INSTANT_INVITE,
  kick: pp.FLAGS.KICK_MEMBERS,
  ban: pp.FLAGS.BAN_MEMBERS,
  admin: pp.FLAGS.ADMINISTRATOR,
  channel: pp.FLAGS.MANAGE_CHANNELS,
  guild: pp.FLAGS.MANAGE_GUILD,
  reactions: pp.FLAGS.ADD_REACTIONS,
  audit: pp.FLAGS.VIEW_AUDIT_LOG,
  topSpeaker: pp.FLAGS.PRIORITY_SPEAKER,
  stream: pp.FLAGS.STREAM,
  view: pp.FLAGS.VIEW_CHANNEL,
  sendMsg: pp.FLAGS.SEND_MESSAGES,
  sendTTS: pp.FLAGS.SEND_TTS_MESSAGES,
  delMsg: pp.FLAGS.MANAGE_MESSAGES,
  embedLink: pp.FLAGS.EMBED_LINKS,
  addFile: pp.FLAGS.ATTACH_FILES,
  msgHist: pp.FLAGS.READ_MESSAGE_HISTORY,
  mentionAll: pp.FLAGS.MENTION_EVERYONE,
  exEmoji: pp.FLAGS.USE_EXTERNAL_EMOJIS,
  guildInsight: pp.FLAGS.VIEW_GUILD_INSIGHTS,
  conVoice: pp.FLAGS.CONNECT,
  speak: pp.FLAGS.SPEAK,
  mute: pp.FLAGS.MUTE_MEMBERS,
  deaf: pp.FLAGS.DEAFEN_MEMBERS,
  move: pp.FLAGS.MOVE_MEMBERS,
  voiceActive: pp.FLAGS.USE_VAD,
  nickname: pp.FLAGS.CHANGE_NICKNAME,
  otherNick: pp.FLAGS.MANAGE_NICKNAMES,
  roles: pp.FLAGS.MANAGE_ROLES,
  webhook: pp.FLAGS.MANAGE_WEBHOOKS,
  emojis: pp.FLAGS.MANAGE_EMOJIS_AND_STICKERS,
  appCmd: pp.FLAGS.USE_APPLICATION_COMMANDS,
  reqSpeak: pp.FLAGS.REQUEST_TO_SPEAK,
  manEvents: pp.FLAGS.MANAGE_EVENTS,
  manThreads: pp.FLAGS.MANAGE_THREADS,
  createPubThread: pp.FLAGS.CREATE_PUBLIC_THREADS,
  createPrivThread: pp.FLAGS.CREATE_PRIVATE_THREADS,
  exSticker: pp.FLAGS.USE_EXTERNAL_STICKERS,
  sendThread: pp.FLAGS.SEND_MESSAGES_IN_THREADS,
  startEmbed: pp.FLAGS.START_EMBEDDED_ACTIVITIES,
  modMem: pp.FLAGS.MODERATE_MEMBERS,
};

const getRoles = async (guildObj, userid) => {
  const userMember = await guildObj.members.fetch(userid);
  return userMember._roles;
};

exports.perms = perms;
exports.getRoles = getRoles;
