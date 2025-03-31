require('dotenv').config();
const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const TRIGGER_REACTION = 'eyes'; // 👀
const SOURCE_CHANNEL = process.env.SOURCE_CHANNEL_ID;
const TARGET_CHANNEL = process.env.TARGET_CHANNEL_ID;

app.event('reaction_added', async ({ event, client }) => {
  if (event.reaction === TRIGGER_REACTION && event.item.channel === SOURCE_CHANNEL) {
    const result = await client.conversations.history({
      channel: event.item.channel,
      latest: event.item.ts,
      inclusive: true,
      limit: 1
    });

    const original = result.messages[0];
    await client.chat.postMessage({
      channel: TARGET_CHANNEL,
      text: `👻 匿名フィードバック:\n>${original.text}`,
      username: "匿名くん",
      icon_emoji: ":ghost:",
    });
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Slack bot is running on port 3000');
})();

