FROM node:16.15.0-alpine

WORKDIR /app

COPY package* ./

RUN npm install 

COPY . ./

CMD node bot.js
