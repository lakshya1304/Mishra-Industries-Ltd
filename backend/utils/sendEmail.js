const nodemailer = require("nodemailer");

/**
 * Mishra Industries - Automated Email Utility
 * Handles Real-Time OTPs and Welcome Onboarding
 */
const sendEmail = async (options) => {
  // 1. Create a transporter using Gmail service
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER, // mishraindustriesltd@gmail.com
      pass: process.env.EMAIL_PASS, // gucqumwjfyvfusku
    },
  });

  let htmlContent = "";

  // 2. Select Template based on email type
  if (options.type === "welcome") {
    htmlContent = `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #edf2f7; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 60px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 4px; text-transform: uppercase; font-weight: 900;">Mishra Industries</h1>
          <p style="color: #bfdbfe; font-size: 11px; margin-top: 10px; text-transform: uppercase; letter-spacing: 2px;">Official Welcome</p>
        </div>
        <div style="padding: 40px; background-color: #ffffff;">
          <h2 style="color: #1e3a8a; font-size: 22px; margin-bottom: 20px;">Welcome to the Family, ${options.name}!</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.8;">We are thrilled to have you onboard. Your account has been successfully registered as a <strong style="color: #1e3a8a;">${options.accountType}</strong>.</p>
          <p style="color: #475569; font-size: 15px; line-height: 1.8;">You now have access to our full industrial inventory, premium B2B pricing, and dedicated support.</p>
          <div style="text-align: center; margin-top: 40px;">
            <a href="https://mishra-industries-ltd-yjfr.onrender.com/login.html" 
               style="background-color: #f97316; color: #ffffff; padding: 18px 40px; text-decoration: none; border-radius: 15px; font-weight: 800; font-size: 13px; text-transform: uppercase; display: inline-block;">
               Login to My Dashboard
            </a>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #f1f5f9;">
          <p style="color: #94a3b8; font-size: 10px; margin: 0; line-height: 1.6;">
            Mishra Industries Limited | Anpara, Uttar Pradesh<br>
            © 2026 All Rights Reserved.
          </p>
        </div>
      </div>`;
  } else {
    htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden;">
        <div style="background-color: #1e3a8a; padding: 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Mishra Industries</h1>
        </div>
        <div style="padding: 40px; background-color: #ffffff;">
          <h2 style="color: #1e3a8a; font-size: 18px;">Security Verification</h2>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">${options.message}</p>
          <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0;">
            <span style="font-size: 36px; font-weight: 900; color: #f97316; letter-spacing: 8px;">${options.otp}</span>
          </div>
          <p style="color: #94a3b8; font-size: 10px; text-align: center; text-transform: uppercase; font-weight: bold;">This code is valid for 10 minutes only.</p>
        </div>
        <div style="background-color: #f1f5f9; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; font-size: 10px; margin: 0;">© 2026 Mishra Industries Limited. Secure Access Protocol.</p>
        </div>
      </div>`;
  }

  // 3. Define the mail options
  const mailOptions = {
    from: `"Mishra Industries" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: htmlContent,
  };

  // 4. Send the mail
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email dispatched to:", options.email);
    return info;
  } catch (error) {
    console.error("Nodemailer Error:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
