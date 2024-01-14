const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

exports.auth = async (req, res, next) => {
  try {
    const token =
      req.cookies || req.header("Authorizattion").replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }
    try {
      const decode = jwt.verify(token, process.env.SECRET_KEY);
      req.user = decode;
    } catch (e) {
      return res.status(401).json({
        success: false,
        message: "Error in token",
      });
    }

    next();
  } catch (e) {
    return res.status(401).json({
      success: false,
      message: "Error in token verification",
    });
  }
};

exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.role !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is protected route for students",
      });
    }
    next();
  } catch (e) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong while verifying the role",
    });
  }
};

exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is protected route for admins",
      });
    }
    next();
  } catch (e) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong while verifying the role",
    });
  }
};

exports.isInstructor = async (req, res, next) => {
  try {
    if (req.user.role !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is protected route for instructors",
      });
    }
    next();
  } catch (e) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong while verifying the role",
    });
  }
};
