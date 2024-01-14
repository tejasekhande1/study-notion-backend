const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

exports.resetPasswordToken = async (req, res) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(401).json({
        status: false,
        message: "User not found",
      });
    }

    const token = crypto.randomUUID();
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { token: token, resetPasswordExpires: Date.now() + 5 * 60 * 1000 },
      { new: true }
    );

    const url = `https://localhost:4200/update-password/${token}`;

    await mailSender(
      email,
      "Password Reset Link",
      `Password Reset Link : ${url}`
    );

    return res.status(200).json({
      success: true,
      message: "Please check your email and change password",
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Error while sending url on email",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    //this token from frontend -> fetch from url and pass to body
    const { password, confirmedPassword, token } = req.body;
    if (password !== confirmedPassword) {
      return res.status(401).json({
        success: false,
        message: "Password does not match.",
      });
    }

    const userDetails = await User.findOne({ token: token });
    if (!userDetails) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.status(401).json({
        success: false,
        message: "Expired token validity",
      });
    }

    const hashedPassword = bcrypt.hash(password, 10);

    await User.findOneAndUpdate(
      { token: token },
      {
        password: hashedPassword,
      },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      message: "Reset Password Successfully",
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Error while reset password",
    });
  }
};
