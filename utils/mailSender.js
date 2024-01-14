const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email, title, body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIl_PASS,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_FROM || "StudyNotion",
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    };

    const emailInfo = await transporter.sendMail(mailOptions);
    console.log("Email sent:", emailInfo.response);
    return emailInfo;
  } catch (e) {
    console.error("Error Occured while send OTP on email : ", e);
  }
};

module.exports = mailSender;
