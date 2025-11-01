// ============================
// bot.js - Telegram -> Firebase
// ============================
// Requires: npm install node-telegram-bot-api axios dotenv
//
// USAGE (recommended):
// 1) create a file named .env locally with TELEGRAM_TOKEN and FIREBASE_URL variables
//    TELEGRAM_TOKEN=8251989506:AAG_U_75djuspDluumsuptnG7ngusnVye0A
//    FIREBASE_URL=https://your-project-id.firebaseio.com/messages.json
// 2) Run: node bot.js
//
// WARNING: do NOT commit your real .env to public GitHub. Use environment variables on hosting (Replit/Render).

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// You can set TELEGRAM_TOKEN in .env or as environment variable.
// For convenience it's shown here but it's strongly recommended to use env vars.
const TOKEN = process.env.TELEGRAM_TOKEN || "8251989506:AAG_U_75djuspDluumsuptnG7ngusnVye0A";
const FIREBASE_URL = (process.env.FIREBASE_URL || "https://your-project-id.firebaseio.com/messages.json").replace(/\/+$/, "") ;

if (!TOKEN) {
  console.error("ERROR: TELEGRAM_TOKEN not set. Put it in .env or environment.");
  process.exit(1);
}
if (FIREBASE_URL.indexOf("your-project-id") !== -1) {
  console.warn("⚠️ FIREBASE_URL masih placeholder. Ganti FIREBASE_URL di .env atau di hosting env vars.");
}

// create bot with polling (if you deploy to host supporting long-running process)
const bot = new TelegramBot(TOKEN, { polling: true });

bot.on('message', async (msg) => {
  try {
    // Skip service/channel join messages if not text
    const text = msg.text || msg.caption || "";
    const user = (msg.from && (msg.from.username || (msg.from.first_name || ""))) || (msg.author_signature || "ChannelAdmin") ;
    const payload = {
      id: msg.message_id,
      user: user,
      text: text,
      date: msg.date || Math.floor(Date.now()/1000)
    };
    // POST to Firebase Realtime Database (creates new child)
    await axios.post(FIREBASE_URL, payload);
    console.log("Saved message -> Firebase:", payload.text ? payload.text.slice(0,80) : "(no-text)");
  } catch (err) {
    console.error("Failed to push to Firebase:", err.message || err);
  }
});

// Optional: handle edited messages (update)
bot.on('edited_message', async (msg) => {
  try {
    const text = msg.text || msg.caption || "";
    const user = (msg.from && (msg.from.username || msg.from.first_name)) || "edited";
    const payload = { id: msg.message_id, user, text, date: msg.date || Math.floor(Date.now()/1000) };
    // This simplistic example appends edited messages as new children.
    await axios.post(FIREBASE_URL, payload);
    console.log("Edited message saved:", payload.id);
  } catch (err) {
    console.error("Edited save error:", err.message || err);
  }
});
