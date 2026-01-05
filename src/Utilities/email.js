import nodemailer from "nodemailer";

import dotenv from "dotenv";
dotenv.config();

export const sendEmail = async (options) => {
  // 1. Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // 2. Email options
  const mailOptions = {
    from: "Polanty Hotels <no-reply@polantyhotels.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3. Send email
  await transporter.sendMail(mailOptions);
};
