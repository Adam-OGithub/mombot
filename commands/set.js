"use strict";
const {
  sMsg,
  getHelp,
  getPre,
  parseQuote,
  countQuote,
  errHandler,
} = require("../custom_nodemods/utils.js");
const {
  perms,
  getRoles,
  checkRoles,
} = require("../custom_nodemods/permissions.js");
const {
  mongoInsert,
  mongoQuery,
  mongoUpdate,
  mongoDelete,
} = require("../custom_nodemods/mongoCon.js");
exports.run = async (client, msg, args, discord, infoObj) => {
  try {
    let isAdmin = false;
    let fArgs = ``;
    const count = countQuote(infoObj);

    if (count === 2) {
      fArgs = parseQuote(infoObj, "set");
    }
    const obj = await getRoles(msg.guild, infoObj.userId);
    const roleObj = checkRoles(msg, obj.roles, [perms.admin, perms.kick]);
    for (const prop in roleObj) {
      if (roleObj[prop]?.admin) {
        isAdmin = true;
      }
    }
    if (isAdmin && msg.author.bot !== true) {
      let query, command, collection;
      const arg1 = args[1];
      if (arg1 !== undefined) {
        let run = true;
        const arg = arg1.toLowerCase();
        let momMsg = ``;
        switch (arg) {
          case "prison":
            query = {
              guildId: infoObj.guildID,
              prisonId: infoObj.channelId,
            };
            command = "set";
            collection = "prison";
            momMsg = `Momma has updated this channel to be the prison!`;
            break;
          case "prison_remove":
            query = {
              guildId: infoObj.guildID,
              prisonId: infoObj.channelId,
            };
            command = "remove";
            collection = "prison";
            momMsg = `Momma has removed the prison!`;
            break;
          case "prison_role":
            let hasVal = false;
            if (count === 2) {
              obj.guildRoles.forEach((value, key) => {
                if (
                  fArgs[1].split(" ").join("").toLowerCase() ===
                  value?.name.split(" ").join("").toLowerCase()
                ) {
                  query = {
                    guildId: infoObj.guildID,
                    prisonRole: value.id,
                  };
                  command = "update";
                  collection = "prison";
                  hasVal = true;
                }
              });
            }

            if (hasVal) {
              momMsg = `Prison role added!`;
            } else if (count < 2) {
              momMsg = `Did not quote role.`;
              run = false;
            } else {
              momMsg = `Unable to locate role.`;
              run = false;
            }
            break;
          case "hello":
            query = {
              guildId: infoObj.guildID,
              helloId: infoObj.channelId,
            };
            command = "set";
            collection = "hello";
            momMsg = `Momma has updated this channel to be able to speak with other discords.`;
            break;
          case "hello_remove":
            query = {
              guildId: infoObj.guildID,
              helloId: infoObj.channelId,
            };
            command = "remove";
            collection = "hello";
            momMsg = `Momma will no longer allow other discords to speak here.`;
            break;
          default:
            run = false;
            momMsg = `Momma sending you some $${getPre()}help !`;
            break;
        }

        if (run) {
          if (command === "set") {
            //
            const res1 = await mongoQuery(
              { guildId: infoObj.guildID },
              collection
            );
            if (res1.length === 0) {
              const res2 = await mongoInsert(query, collection);
              if (res2.acknowledged) {
                sMsg(msg.channel, momMsg);
              } else {
                sMsg(msg.channel, `Unable to set ${arg}.`);
              }
            } else if (res.length > 0) {
              sMsg(
                msg.channel,
                `${arg} already exists please remove before setting.`
              );
            }
          } else if (command === "remove") {
            const res1 = await mongoQuery(
              { guildId: infoObj.guildID },
              collection
            );
            if (res1.length === 0) {
              sMsg(
                msg.channel,
                `${arg}  does exists please create before removing`
              );
            } else {
              const res = await mongoDelete(
                { guildId: infoObj.guildID },
                collection
              );
              if (res.acknowledged) {
                sMsg(msg.channel, momMsg);
              } else {
                sMsg(msg.channel, `Unable to remove ${arg}.`);
              }
            }
          } else if (command === "update") {
            const res = await mongoQuery(
              { guildId: infoObj.guildID },
              collection
            );
            if (res.length === 0) {
              sMsg(
                msg.channel,
                `${arg}  does exists please create before removing`
              );
            } else {
              const res = await mongoUpdate(
                { guildId: infoObj.guildID },
                { $set: query },
                collection
              );
              if (res.acknowledged) {
                sMsg(msg.channel, momMsg);
              } else {
                sMsg(msg.channel, `Unable to update ${arg}.`);
              }
            }
          }
        } else {
          sMsg(msg.channel, momMsg);
        }
      } else {
        getHelp(msg.channel, "set");
      }
    } else {
      sMsg(msg.channel, "You must get permission from Dad.");
    }
  } catch (e) {
    errHandler(e, infoObj, true, msg.channel);
  }
};
