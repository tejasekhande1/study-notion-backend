const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail");
const mongoose = require("mongoose");

exports.capturePayment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid course id",
      });
    }

    let course;
    try {
      course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const uId = new mongoose.Types.ObjectId(userId);
      if (course.studentEnrolled.includes(uId)) {
        return res.status(200).json({
          success: false,
          message: "Course already entrolled",
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error while checking course enrolled by student",
        error: error,
      });
    }

    // create-order
    const amount = course.price;
    const currency = "INR";

    const options = {
      amount: amount * 100,
      currency: currency,
      receipt: Math.random(Date.now()).toString(),
      notes: {
        courseId: courseId,
        userId: userId,
      },
    };

    try {
      const paymentResponse = await instance.orders.create(options);
      console.log("Payment Response -> ", paymentResponse);
      return res.status(200).json({
        success: true,
        message: "Course successfully enrolled",
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        thumbnail: course.thumbnail,
        orderId: paymentResponse.id,
        amount: paymentResponse.amount,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error while creating order",
        error: error,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while buying course",
      error: error,
    });
  }
};

exports.verifySignature = async (req, res) => {
  try {
    const webHookSecret = "12345";
    const signatureSecret = req.headers["x-razorpay-signature"];

    const shasum = crypto.createHmac("sha256", webHookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest === signatureSecret) {
      console.log("Payment is authorized");
      const { courseId, userId } = req.body.payload.payment.entity.notes;

      try {
        const enrolledCourse = await Course.findOneAndUpdate(
          { _id: courseId },
          {
            $push: {
              studentEnrolled: userId,
            },
          },
          { new: true }
        );

        if (!enrolledCourse) {
          return res.status(400).json({
            success: false,
            message: "Error while enrolling course",
          });
        }

        const userDetails = await User.findOneAndUpdate(
          { _id: userId },
          {
            $push: {
              courses: courseId,
            },
          },
          { new: true }
        );

        const emailResponse = await mailSender(
          userDetails.email,
          "Congratutions from study-notion",
          `Congratulation..you are onboarding on ${enrolledCourse.courseName} course`
        );

        return res.status(200).json({
          success: true,
          message: "Signature verified and course added",
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Error while enrolling course",
          error: error,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while verifying signature",
      error: error,
    });
  }
};
