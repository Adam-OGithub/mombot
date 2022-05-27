"use strict";
//in place for to many requests
const { dateInfo, argToReg, sMsg, msgAuth, getPre } = require("./utils.js");
const { mongoInsert, mongoQuery, mongoUpdate } = require("./mongoCon.js");
const userMap = new Map();

const userSpam = (userName, epTime, helloReg, infoObj) => {
  const maxMessages = 15;
  const inSeconds = 120;
  const expireSecsTime = 3600;
  const mappedUser = userMap.get(userName);
  if (mappedUser.lastSubmitTime <= epTime - inSeconds) {
    mappedUser.helloCount = 1;
  }

  if (mappedUser.helloCount >= maxMessages) {
    isLockedCheck(infoObj, userName, epTime, helloReg, expireSecsTime);
    mappedUser.block = {
      type: "USER CHAT SPAM",
      code: 2,
      maxExpire: expireSecsTime,
    };
  } else {
    let count = mappedUser.helloCount;
    count++;
    mappedUser.helloCount = count;
  }
};

const isLockedCheck = (infoObj, userName, epTime, helloReg, altSecs) => {
  let secs = 600;
  let lockAddition = 60;
  let helloBypass = false;
  if (altSecs !== undefined) {
    secs = altSecs;
    helloBypass = true;
    lockAddition = 300;
  }

  const mappedUser = userMap.get(userName);
  const maxLockOutSecs = secs;

  if (mappedUser.locked) {
    //Resets expire time if waited the number of minutes
    //If not then adds additional minute per command
    if (
      mappedUser.lockExpire > 0 &&
      mappedUser.lockExpire < mappedUser.currentSubmitTime
    ) {
      mappedUser.helloCount = 1;
      mappedUser.helloLocked = false;
      mappedUser.locked = false;
      mappedUser.lockExpire = 0;
      mappedUser.count = 1;
      mappedUser.notifiedChannel = false;
    } else {
      if (helloReg !== "hello" || helloBypass) {
        mappedUser.helloBypass = helloBypass;
        mappedUser.lockExpire = mappedUser.lockExpire + lockAddition;
      }
    }
  } else {
    // mongoQuery({ guildId: infoObj.guildID }, "prison").then((res) => {
    //   if (res.length > 0) {
    //     const pObj = res[0];
    //     const prisonRole = infoObj.guildRoles.get(pObj.prisonRole);

    //     infoObj.userRoles.forEach((roleId) => {
    //       infoObj.msgObj.member.roles.remove(roleId);
    //     });
    //     infoObj.msgObj.member.roles.add(prisonRole);
    //     mongoInsert({ $push: { guildId: infoObj.guildID } });
    //   }
    // });
    //
    mappedUser.locked = true;
    mappedUser.lockExpire = epTime + maxLockOutSecs;
  }
};

const commandSpam = async (message, infoObj, select) => {
  const helloReg = await argToReg(select, ["hello"]);
  const TrysPerMinute = 10;
  const inSeconds = 60;
  const mappedUser = userMap.get(infoObj.tag);
  const userName = infoObj.tag;
  const epTime = dateInfo.sinceEpoc();
  if (message.author.bot !== true) {
    if (mappedUser === undefined) {
      userMap.set(userName, {
        tag: userName,
        currentSubmitTime: epTime,
        lastSubmitTime: epTime,
        submitCount: 1,
        lockExpire: 0,
        locked: false,
        notifiedChannel: false,
        helloCount: 0,
        helloBypass: false,
        notifiedcount: 0,
        block: {},
      });
    } else {
      mappedUser.lastSubmitTime = mappedUser.currentSubmitTime;
      mappedUser.currentSubmitTime = epTime;
      if (mappedUser.submitCount > TrysPerMinute) {
        isLockedCheck(infoObj, userName, epTime, helloReg);
        mappedUser.block = {
          type: "COMMAND CHAT SPAM",
          code: 1,
          maxExpire: 600,
        };
      } else {
        //resets counter
        if (mappedUser.lastSubmitTime <= epTime - inSeconds) {
          mappedUser.count = 1;
        }
      }

      if (helloReg !== "hello") {
        //addes count to user map objecct
        let count = mappedUser.submitCount;
        count++;
        mappedUser.submitCount = count;
      }
    }
    userSpam(userName, epTime, helloReg, infoObj);
  } else {
    userMap.set(userName, { bypass: true });
  }
  return userMap.get(userName);
};

const spamMsg = (message, select, infoObj, client) => {
  const mappedUser = userMap.get(infoObj.tag);
  const humanDate = `${new Date(mappedUser.lockExpire * 1000)}`;
  let instructions = "";

  switch (mappedUser.block.code) {
    case 1:
      instructions = `use the commands with ***${getPre()}*** `;
      break;
    case 2:
      instructions = "chat in any channel";
      break;
    default:
      instructions = "Code not found";
      break;
  }

  const additionalMsg = `You were blocked for ***${mappedUser.block.type}***, If you ${instructions} you will be blocked for an additonal ***${mappedUser.block.maxExpire}*** seconds`;
  const msg30 = `You are blocked from using ***${client.user.tag}*** until ***${humanDate}***.\n\n${additionalMsg}.\n\nYou will only recieve this message every ***30*** messages.`;
  if (mappedUser.notifiedChannel === false) {
    sMsg(
      message.channel,
      `User ***${infoObj.tag}*** is blocked from commands until ***${humanDate}***, further messages will be sent directly.${additionalMsg}.`
    );
  } else {
    if (select !== "hello" || mappedUser.helloBypass) {
      let count = mappedUser.notifiedcount;
      count++;
      mappedUser.notifiedcount = count;
      if (mappedUser.notifiedcount <= 1) {
        msgAuth(message, msg30);
      } else if (mappedUser.notifiedcount === 31) {
        mappedUser.notifiedcount = 2;
        msgAuth(message, msg30);
      }
    }
  }
  mappedUser.notifiedChannel = true;
};
exports.commandSpam = commandSpam;
exports.spamMsg = spamMsg;
