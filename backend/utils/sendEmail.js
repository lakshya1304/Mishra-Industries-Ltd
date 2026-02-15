const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER, // Your Gmail address from .env
            pass: process.env.GMAIL_PASS  // Your Gmail App Password from .env
        }
    });

    // 2. Define email options
    const mailOptions = {
        from: `Mishra Industries <${process.env.GMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: `
            <div style="font-family: sans-serif; border: 1px solid #e2e8f0; padding: 20px; border-radius: 10px;">
                <h2 style="color: #1e3a8a;">Mishra Industries Limited</h2>
                <p>Hello,</p>
                <p>${options.message}</p>
                <div style="background: #fffaf0; border: 2px dashed #f97316; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1e3a8a;">
                    ${options.otp}
                </div>
                <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
                    This OTP is valid for 10 minutes. If you did not request this, please ignore this email.
                </p>
            </div>
        `
    };

    // 3. Send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;