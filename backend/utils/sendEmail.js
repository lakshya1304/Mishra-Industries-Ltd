const nodemailer = require("nodemailer");

// Changed to accept an object so it matches your controller calls
const sendEmail = async ({
  email,
  subject,
  message,
  type,
  name,
  accountType,
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "mishraindustriesltd@gmail.com",
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  // Dynamic template selection
  let body = message;
  if (type === "welcome") {
    body = `Hello ${name},\n\nWelcome to Mishra Industries Limited! Your ${accountType} account has been successfully created.\n\nBest Regards,\nTeam Mishra Atlas`;
  }

  const mailOptions = {
    from: '"Mishra Industries" <mishraindustriesltd@gmail.com>',
    to: email,
    subject: subject,
    text: body,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
