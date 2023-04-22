'use strict';
const { Configuration, OpenAIApi } = require('openai');
const config = require('../config.json');
const {
  sendChannelMsgNoInteraction,
  getChannelFromClient,
} = require('../custom_node_modules/utils');

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
  sendChannelMsgNoInteraction(
    getChannelFromClient(client, fullMsg.guildId, fullMsg.channelId),
    chatResponse,
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
