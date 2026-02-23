const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "mishraindustriesltd@gmail.com",
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: "Mishra Industries <mishraindustriesltd@gmail.com>",
    to,
    subject,
    text,
  });
};

module.exports = sendEmail;
