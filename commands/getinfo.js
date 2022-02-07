"use strict";
const {
  tryFail,
  sMsg,
  makeEmbed,
  errmsg,
} = require("../custom_nodemods/utils.js");
const {
  perms,
  getRoles,
  checkRoles,
} = require("../custom_nodemods/permissions.js");
exports.run = async (client, msg, args, discord, infoObj) => {
  try {
    let isAdmin = false;

    getRoles(msg.guild, infoObj.userId)
      .then((obj) => {
        const roleObj = checkRoles(msg, obj.roles, [perms.admin, perms.kick]);
        for (const prop in roleObj) {
          if (roleObj[prop]?.admin) {
            isAdmin = true;
          }
        }
        if (isAdmin && msg.author.bot !== true) {
          const iO = infoObj;
          const embed = makeEmbed(
            `Server Info`,
            `Guild name: ${iO.guildName}\nGuild id: ${iO.guildID}\nChannel name: ${iO.channelName}\nChannel id: ${iO.channelId}\nMember count: ${iO.guildMemCount}`
          );
          sMsg(msg.channel, embed);
        } else {
          sMsg(msg.channel, "You must get permission from Dad.");
        }
      })
      .catch((e) => {
        errmsg(e);
        sMsg(msg.channel, "Something went wrong");
      });
  } catch (e) {
    tryFail(msg.channel, e);
  }
};
