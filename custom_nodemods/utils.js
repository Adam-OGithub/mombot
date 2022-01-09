"use strict";
const randomWord = (arr) => arr[Math.trunc(Math.random() * arr.length)];

const round = (myInt) => Math.trunc(myInt);

exports.randomWord = randomWord;
exports.round = round;
