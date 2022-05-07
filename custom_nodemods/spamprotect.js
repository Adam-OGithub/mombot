"use strict";
//in place for to many requests
const { dateInfo, argToReg } = require("./utils.js");
const userMap = new Map();

const userSpam = (userName, epTime, helloReg) => {
  const maxMessages = 50;
  const inSeconds = 120;
  const expireSecsTime = 3600;
  const mappedUser = userMap.get(userName);
  if (mappedUser.lastSubmitTime <= epTime - inSeconds) {
    mappedUser.helloCount = 1;
  }

  if (mappedUser.helloCount >= maxMessages) {
    isLockedCheck(userName, epTime, helloReg, expireSecsTime);
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

const isLockedCheck = (userName, epTime, helloReg, altSecs) => {
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
    mappedUser.locked = true;
    mappedUser.lockExpire = epTime + maxLockOutSecs;
  }
};

const commandSpam = async (message, infoObj, select) => {
  const helloReg = await argToReg(select, ["hello"]);
  const TrysPerMinute = 7;
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
        isLockedCheck(userName, epTime, helloReg);
        mappedUser.block = {
          type: "COMMAND CHAT SPAM",
          code: 1,
          maxExpire: expireSecsTime,
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
    userSpam(userName, epTime, helloReg);
  } else {
    userMap.set(userName, { bypass: true });
  }
  return userMap.get(userName);
};

exports.commandSpam = commandSpam;
