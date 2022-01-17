"use strict";
const {
  sMsg,
  makeEmbed,
  getHelp,
  dates,
  getChannel,
  getUser,
  getPre,
  parseUsrChan,
} = require("../custom_nodemods/utils.js");

const delay = async (reminder) => {
  setTimeout(() => {
    reminder.channels.forEach((channelObj) => {
      sMsg(channelObj, reminder.fullmsg);
    });
  }, reminder.time);
};

exports.run = async (client, msg, args, discord, infoObj) => {
  const reminder = {};
  let count = 0;
  //check if entry is user or channel
  const [channels, users, usersF] = parseUsrChan(infoObj.msg);
  reminder.users = `${usersF.join(" ")}`;

  const myCheck = infoObj.msg.split("");
  myCheck.forEach((entry) => {
    if (entry === `"`) {
      count++;
    }
  });

  if (count === 4) {
    const fArgs = infoObj.msg
      .split(`${getPre()}remind`)[1]
      .split("")
      .map((letter) => (letter === `"` ? `^^A^^` : letter))
      .join("")
      .split("^^A^^");
    reminder.timetemp = fArgs[1];
    reminder.msg = fArgs[3];
  }

  //Gets all channel objects mentioned
  if (channels.length > 0 && reminder?.time !== " " && count === 4) {
    const channelArr = [];
    channels.forEach((entry) => {
      channelArr.push(getChannel(entry, infoObj));
    });
    reminder.channels = channelArr;

    const time = reminder.timetemp
      .split("/")
      .join("^")
      .split(" ")
      .join("^")
      .split(":")
      .join("^")
      .split("^");
    console.log(+`20${time[2]}`, +time[0], +time[1], +time[3], +time[4], 0);
    const timeSet = Math.floor(
      new Date(+`20${time[2]}`, +time[0], +time[1], +time[3], +time[4], 0)
    );
    console.log(new Date(2022, 4, 29 - 1, 22, 0, 0, 0));
    console.log(
      new Date(
        +`20${time[2]}`,
        +time[0] - 1,
        +time[1] - 1,
        +time[3],
        +time[4],
        0
      )
    );
    const newTime = dates.epocSecs() - timeSet;
    console.log(newTime);

    reminder.time = newTime;
    reminder.fullmsg = `${reminder.msg} ${reminder.users}`;
    delay(reminder);
  } else {
    getHelp(msg.channel);
  }
};
