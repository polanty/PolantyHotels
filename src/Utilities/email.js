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

//Create an Object to return a method to send a welcome email
//send a password reset email
//password succefully updated email
//booking confirmation email
// and later on Booking cancellation and other functionality

class EmailService {
  constructor() {
    //Code within constructor are called first before any other code in an Object

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

    this.from = "Polanty Hotels <no-reply@polantyhotels.com>";
  }

  async send({ email, subject, message }) {
    const mailOptions = {
      from: this.from,
      to: email,
      subject,
      text: message,
    };

    await this.transporter.sendMail(mailOptions);
  }

  // SPECIFIC EMAIL TEMPLATES
  async sendSignupEmail(email, name) {
    return this.send({
      email,
      subject: "Welcome to Polanty Hotels",
      message: `Hi ${name},\n\nThank you for signing up with Polanty Hotels.\nWe're excited to have you onboard.`,
    });
  }

  async sendForgotPasswordEmail(email, resetLink) {
    return this.send({
      email,
      subject: "Reset Your Password",
      message: `You requested a password reset.\nClick the link below:\n${resetLink}\n\nIf you didn't request this, ignore this email.`,
    });
  }

  async sendBookingEmail(email, bookingDetails) {
    return this.send({
      email,
      subject: "Your Booking Confirmation",
      message: `Your booking is confirmed.\n\nDetails:\n${bookingDetails}\n\nThank you for choosing Polanty Hotels.`,
    });
  }

  async sendFeedbackEmail(email, feedbackMessage) {
    return this.send({
      email,
      subject: "Thank You for Your Feedback",
      message: `We appreciate your feedback:\n\n"${feedbackMessage}"\n\nThank you for helping us improve.`,
    });
  }
}

// export default new EmailService();

//Testing Links
// 1.await emailService.sendSignupEmail(user.email, user.name);
// 2.await emailService.sendForgotPasswordEmail(user.email, resetUrl);
// 3.await emailService.sendBookingEmail(
//   user.email,
//   `Hotel: ${hotelName}\nCheck-in: ${checkIn}\nCheck-out: ${checkOut}`
// );
// 4.await emailService.sendFeedbackEmail(user.email, feedbackText);
