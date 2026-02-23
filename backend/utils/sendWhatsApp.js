const twilio = require("twilio");

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sendWhatsApp = async (phone, message) => {
  await client.messages.create({
    from: "whatsapp:+14155238886", // Twilio sandbox number
    to: `whatsapp:+91${phone}`,
    body: message,
  });
};

module.exports = sendWhatsApp;
