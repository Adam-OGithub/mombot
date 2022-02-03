"use strict";

const momSayings = [
  "Don't forget to take ya li'l inCloths off and leave 'em by the dad gomn door.",
  "Momma ain't gonna tarry her night away from her stories now... Jus' messin', honey.",
  "There's some inColdFood in the fridge",
  "Momma gonna make you and your friends a full on inGame , LAN party lovin' spread.",
  "Love you, sweetie. Be safe.",
  "Baby, if you're gonna experiment, I'd rather you experiment where momma can take care of you.",
  "Shhhhhh... inShow is on...",
  "The day they cancel inShow is the day I burn it all down, sweetie.",
  "Take them knickers off so I can rub them stains out.",
  "Every day you come home with no grand kids for momma, is a day i'd rather forget.",
  "You can do _**ANYTHING**_!",
  "Honey, momma brought you into this world, and I can sure as hell take you out",
  "_**SELLS ALL YOUR inItems IN A GARAGE SALE WHILE YOU'RE NOT HOME**_",
  "I have to check your poop.",
  "Why are you naked?",
  "I made you some inDinner , dear. Can't have my littl'in going hungry.",
  "Hope you like inDinner ! Ms. inPeople from tuesday's Bridge gave me her late Aunty Ovil's recipe, and I've just been dyin' to treat you kiddos with it",
  "Honey pies, momma's going out and lettin her hair down tonight. Wouldn't leave your little cauldrons empty. No siree, not in a million years, so you'll find some inDinner warm in the oven. kiss kiss, and don't stay up too late",
  "Honey, We have inItems at home, now put that down.",
];
const clothing = [
  "shoes",
  "shirt",
  "socks",
  "pants",
  "hat",
  "underwear",
  "gloves",
  "dress",
  "skirt",
  "jeans",
  "sweater",
];
const foods = [
  "ice pops",
  "meatloaf",
  "chicken",
  "soup",
  "skinny chicken salad",
  "salad-stuffed avacado",
  "crab salad",
  "watermelon",
  "bruschetta",
  "eggs and bacon",
];
const dinner = [
  "meatloaf",
  "chicken dumplings",
  "baby back ribs",
  "beef stroganoff",
  "chili",
  "pancakes",
  "hummus",
  "muffins",
  "bread",
];
const games = [
  "Street Fighter",
  "Super Smash Bros",
  "Marvel vs. Capcom",
  "Tekken",
  "Doom",
  "Quake",
  "Counter-Strike series",
  "Call of Duty series",
  "Unreal Tournament",
  "Halo series",
  "Painkiller",
  "Battlefield series",
  "CrossFire",
  "Overwatch",
  "Team Fortress 2",
  "Rainbow Six: Siege",
  "Alliance of Valiant Arms",
  "Special Force II",
  "StarCraft: Brood War",
  "Warcraft III",
  "StarCraft II",
  "FIFA series",
  "Madden",
  "NBA 2K",
  "Pro Evolution Soccer",
  "Rocket League",
  "iRacing",
  "Project CARS",
  "TrackMania",
  "Dota 2",
  "League of Legends",
  "Heroes of the Storm",
  "Heroes of Newerth",
  "Smite",
  "Vainglory",
  "EndGods",
  "Gears of War",
  "War Thunder",
  "World of Tanks",
  "World of Warcraft",
  "Hearthstone",
  "Pokémon",
  "Puyo Puyo",
  "Tetris",
  "Splatoon",
];
const tvshows = ["Lifetime", "The walking dead", "The Rookie", "Dexter"];
const people = ["Charlet", "Cheryl", "Ava", "Sophia", "Mia", "Isabella"];
const items = [
  "ACTION FIGURES",
  "TOYS",
  "WEED",
  "YU-GH-IO CARDS",
  "POKEMAN CARDS",
  "PUZZLES",
];

const botStatus = ["With all your data", "Candy Crush Saga", ...games];

//https://and-here-is-my-code.glitch.me/
const animalApi = [
  "lizards",
  "raccoon",
  "dingo",
  "camel",
  "crab",
  "cow",
  "hippo",
  "fish",
  "chicken",
  "shark",
  "lion",
  "whale",
  "snake",
  "cat",
  "dog",
  "bear",
  "killerwhale",
  "giraffe",
  "dolphin",
];

//https://and-here-is-my-code.glitch.me/
const animalImageaApi = [
  "sheep",
  "crab",
  "shark",
  "chicken",
  "hippo",
  "rhino",
  "lion",
  "dingo",
  "penguin",
  "dolphin",
  "camel",
  "bear",
  "horse",
  "duck",
  "pig",
  "cow",
  "snake",
  "killwhale",
  "giraffe",
  "elephant",
  "turtle",
  "lizard",
  "dog",
  "cat",
  "panda",
  "spider",
];
const weatherWords = {
  cold: `Momma suggest you wear a heavy coat.`,
  kindaCold: `Momma suggest a light coat.`,
  normal: `Go out an play honey momma loves this temp.`,
  kindaHot: `Momma is sweating a little, but still feeling good.`,
  hot: `Momma sweating her buttock off.`,
  reallyhot: `Holy hot balls of fire momma is staying in today. We need some water in here.`,
  windy: `I don't think we are in Kansas anymore.`,
};

exports.momSayings = momSayings;
exports.clothing = clothing;
exports.foods = foods;
exports.dinner = dinner;
exports.games = games;
exports.tvshows = tvshows;
exports.people = people;
exports.items = items;
exports.botStatus = botStatus;
exports.weatherWords = weatherWords;
exports.animalApi = animalApi;
exports.animalImageaApi = animalImageaApi;
