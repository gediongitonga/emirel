const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());

const VERIFY_TOKEN = "emirelfarm_token";
const WHATSAPP_TOKEN = "YOUR_ACCESS_TOKEN";
const PHONE_NUMBER_ID = "YOUR_PHONE_NUMBER_ID";

const replyMenu = `Welcome to Emirel Farm! How can I help you today?
1. Learn about pig banking
2. Book a consultation
3. Buy quality feeds
4. Talk to support

Meanwhile, you can visit our website for more info:
https://www.emirelfarm.africa`;

const responses = {
  "1": "Pig Banking is our innovative model where you raise pigs with our support and we handle the marketing for you.",
  "2": "To book a consultation, please call or WhatsApp us on +234XXXXXX or visit the contact form on our website.",
  "3": "We offer premium pig feeds tested and trusted by top farms. Let us know your location and quantity.",
  "4": "Our support team is happy to assist! Please hold on or leave your message — we’ll respond shortly.",
};

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (message) {
    const from = message.from;
    const text = message.text?.body?.trim();

    const isKnownOption = responses[text];
    const replyText = isKnownOption ? responses[text] : replyMenu;

    await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: from,
        text: { body: replyText },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  }
  res.sendStatus(200);
});

app.listen(3000, () => console.log("Emirel Farm bot is live"));
