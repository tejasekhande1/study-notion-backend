const Course = require("../models/Course");
const Tag = require("../models/Tag");
const User = require("../models/User");
const { uploadToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

exports.createCourse = async (req, res) => {
  try {
    const { courseName, courseDescription, whatYouWillLearn, price, tag } =
      req.body;

    const thumbnail = req.files.image;

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag
    ) {
      return res.status(400).json({
        status: false,
        message: "All fields are required",
      });
    }

    const userId = req.user.id;
    const instructorDetails = await User.findOne({ userId });

    if (!instructorDetails) {
      return res.status(404).json({
        status: false,
        message: "Instructor details not found",
      });
    }

    const tagDetails = await Tag.findById(tag);
    if (!tagDetails) {
      return res.status(404).json({
        status: false,
        message: "Tag details not found",
      });
    }

    const thumbnailImage = await uploadToCloudinary(
      thumbnail,
      process.env.FOLDER
    );

    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn,
      price,
      tag: tagDetails._id,
      thumbnail: thumbnailImage.secure_url,
    });

    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (e) {
    return res.status(500).json({
      status: false,
      message: "Error occured while creating course",
    });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = courses
      .find(
        {},
        { courseName: true, instructor: true, price: true, thumbnail: true }
      )
      .populate("instructor")
      .exec();

    return res.status(200).json({
      status: true,
      message: "All Courses are fetched",
      data: courses,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error occured while fetching courses",
      error: error,
    });
  }
};
