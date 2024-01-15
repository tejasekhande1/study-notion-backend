const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

exports.createCourse = async (req, res) => {
  try {
    const {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag,
      category,
    } = req.body;

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

    const categoryDetails = await Category.findById(category);
    if (!categoryDetails) {
      return res.status(404).json({
        status: false,
        message: "Category details not found",
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
      category: categoryDetails._id,
      tag: tag,
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
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error occured while creating course",
      error: error,
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

exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const courseDetails = await Course.findById(courseId).populate(
      "instructor"
    );

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course details retrieved successfully",
      data: courseDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error occurred while fetching course details",
      error: error,
    });
  }
};
