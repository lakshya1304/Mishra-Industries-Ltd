import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `Mishra Industries ${process.env.MAIL}`,
    to,
    subject,
    text,
  });
};

export default sendEmail;
