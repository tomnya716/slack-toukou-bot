require('dotenv').config();
const { App, ExpressReceiver } = require('@slack/bolt');

// ✅ 1. ExpressReceiverで /slack/events を受け付ける
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  endpoints: '/slack/events', // Slackに設定するURLと一致！
});

// ✅ 2. Bolt App を receiver 経由で初期化
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver,
});

const TRIGGER_REACTION = '投稿';
const SOURCE_CHANNEL = process.env.SOURCE_CHANNEL_ID;
const TARGET_CHANNEL = process.env.TARGET_CHANNEL_ID;

// ✅ 3. reaction_added イベントを処理
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
      text: `<!channel> 👻 アナウンス:\n>${original.text}`,
      username: "匿名くん",
      icon_emoji: ":ghost:",
    });
  }
});

// ✅ 4. サーバー起動（Renderがここを呼び出す）
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Slack bot is running on port 3000');
})();
