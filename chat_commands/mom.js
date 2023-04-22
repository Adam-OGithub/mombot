'use strict';
const { Configuration, OpenAIApi } = require('openai');
const config = require('../config.json');
const {
  sendChannelMsgNoInteraction,
  getChannelFromClient,
} = require('../custom_node_modules/utils');
const endings = ['.', '?', '!'];

const configuration = new Configuration({
  apiKey: config.openAi.key,
});

const openai = new OpenAIApi(configuration);

const startChat = async (client, fullMsg, chatMsg) => {
  const completion = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: chatMsg,
  });
  const chatResponse = completion.data.choices[0].text;
  console.log('CHAT RES:', chatResponse);
  let finalResponse = '';
  let theEnd = '';
  if (
    chatResponse.endsWith('.') ||
    chatResponse.endsWith('?') ||
    chatResponse.endsWith('!')
  ) {
    finalResponse = chatResponse;
  } else {
    let currentIndex = 0;
    // const newChatResponse = chatResponse.replace(/\n/gi, '');
    console.log('NEW CHAT:', chatResponse);
    const splitSentence = chatResponse.split('');
    console.log('SPLITSENTENCE:', splitSentence);
    splitSentence.forEach((letter, i) => {
      console.log('letter:', letter);
      if (endings.includes(letter)) {
        currentIndex = i;
      }
    });
    console.log('INDEX', currentIndex);
    let newIndex = currentIndex;

    if (currentIndex === 0) {
      newIndex = splitSentence.length;
      theEnd = '.';
    }

    finalResponse = splitSentence.slice(0, newIndex + 1).join('');
  }

  console.log('FINALRES:', finalResponse);
  sendChannelMsgNoInteraction(
    getChannelFromClient(client, fullMsg.guildId, fullMsg.channelId),
    finalResponse + theEnd,
    false
  );
};

module.exports = {
  async execute(client, fullMsg, chatMsg) {
    try {
      await startChat(client, fullMsg, chatMsg);
    } catch (e) {}
  },
};
