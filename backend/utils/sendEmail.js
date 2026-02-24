import nodemailer from "nodemailer";
import debugStore from "./debugStore.js";

/**
 * sendEmail accepts either (to, subject, text) or a single object
 * { email, subject, message, type, name }
 */
export const sendEmail = async (toOrObj, subject, text) => {
  // Normalize arguments
  let to = toOrObj;
  let msg = text || "";
  if (typeof toOrObj === "object") {
    to = toOrObj.email || toOrObj.to;
    subject = toOrObj.subject || subject;
    msg = toOrObj.message || toOrObj.text || toOrObj.body || msg;
  }

  // Console fallback for local development or missing mail credentials
  if (
    !process.env.MAIL ||
    !process.env.MAIL_PASS ||
    process.env.NODE_ENV !== "production"
  ) {
    console.log("[EMAIL-FALLBACK] To:", to);
    console.log("[EMAIL-FALLBACK] Subject:", subject);
    console.log("[EMAIL-FALLBACK] Message:", msg);
    // If message contains a 6-digit OTP, store it in debug store for test retrieval
    try {
      const m = String(msg).match(/\b(\d{6})\b/);
      if (m && m[1]) {
        // store under email key
        debugStore.setOTP(to, m[1]);
      }
    } catch (e) {
      // ignore
    }
    return true;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `Mishra Industries <${process.env.MAIL}>`,
    to,
    subject,
    text: msg,
  });
  return true;
};

export default sendEmail;
