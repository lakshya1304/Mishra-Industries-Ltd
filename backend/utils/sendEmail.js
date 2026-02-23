const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL,
      pass: process.env.MAIL_PASS,
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
