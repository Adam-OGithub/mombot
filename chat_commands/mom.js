'use strict';
const { OpenAI } = require('openai');
const config = require('../config.json');
const {
  sendChannelMsgNoInteraction,
  getChannelFromClient,
} = require('../custom_node_modules/utils');

const openai = new OpenAI({
  apiKey: config.openAi.key,
});

const startChat = async (client, fullMsg, chatMsg) => {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: chatMsg }],
    model: 'gpt-3.5-turbo',
  });

  sendChannelMsgNoInteraction(
    getChannelFromClient(client, fullMsg.guildId, fullMsg.channelId),
    chatCompletion.choices[0].message.content,
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
