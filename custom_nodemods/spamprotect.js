"use strict";
//in place for to many requests
const { dateInfo, argToReg } = require("./utils.js");
const userMap = new Map();

const commandSpam = async (message, infoObj, select) => {
  const helloReg = await argToReg(select, ["hello"]);
  const TrysPerMinute = 7;
  const maxLockOutSecs = 600;
  const lockAddition = 60;
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
      });
    } else {
      mappedUser.lastSubmitTime = mappedUser.currentSubmitTime;
      mappedUser.currentSubmitTime = epTime;
      if (mappedUser.submitCount > TrysPerMinute) {
        if (mappedUser.locked) {
          //Resets expire time if waited the number of minutes
          //If not then adds additional minute per command
          if (
            mappedUser.lockExpire > 0 &&
            mappedUser.lockExpire < mappedUser.currentSubmitTime
          ) {
            mappedUser.locked = false;
            mappedUser.lockExpire = 0;
            mappedUser.count = 1;
            mappedUser.notifiedChannel = false;
          } else {
            if (helloReg !== "hello") {
              mappedUser.lockExpire = mappedUser.lockExpire + lockAddition;
            }
          }
        } else {
          mappedUser.locked = true;
          mappedUser.lockExpire = epTime + maxLockOutSecs;
        }
      } else {
        //resets counter
        if (mappedUser.lastSubmitTime <= epTime - 60) {
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
  } else {
    userMap.set(infoObj.tag, { bypass: true });
  }
  return userMap.get(infoObj.tag);
};

exports.commandSpam = commandSpam;
