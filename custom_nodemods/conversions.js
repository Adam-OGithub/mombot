"use strict";

//Converts kelvin to fahrenheit
const convertKToF = (K) =>
  K !== undefined
    ? ((+K - 273.15) * 9) / 5 + 32
    : `Your guess is as good as mine.`;

//Converts meter to mile
const meterToMile = (M) =>
  M !== undefined
    ? `${(M * 2.236936).toFixed(2)}/mph`
    : `Your guess is as good as mine.`;

//Converts millimetters to inches
const milToIn = (M) => (M !== undefined ? (M * 0.03937).toFixed(2) : 0);

//Converts milliliters to oz
const millToOz = (mil) => (mil !== undefined ? mil * 0.033814 : mil);
//converts grams to oz
const gramToOz = (gram) => (gram !== undefined ? gram * 0.03527396195 : gram);
//converts kilos to lbs
const kiloToLb = (kilo) => (kilo !== undefined ? kilo * 2.20462262185 : kilo);

exports.convertKToF = convertKToF;
exports.meterToMile = meterToMile;
exports.milToIn = milToIn;
exports.millToOz = millToOz;
exports.gramToOz = gramToOz;
exports.kiloToLb = kiloToLb;
