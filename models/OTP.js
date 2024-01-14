const mailSender = require("../utils/mailSender");
const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60,
  },
});

async function sendEmail(email, otp) {
  try {
    await mailSender(email, "Verification Mail From StudyNotion", otp);
  } catch (e) {
    console.log("Error occured while sending verification email ", e);
  }
}

OTPSchema.pre("save", async function (next) {
  await sendEmail(this.email, this.otp);
  next();
});

module.exports = mongoose.model("OTP", OTPSchema);
