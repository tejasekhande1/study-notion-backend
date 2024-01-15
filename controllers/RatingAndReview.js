const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const User = require("../models/User");

exports.createRatingAndReview = async (req, res) => {
  try {
    const { courseId, rating, review } = req.body;
    const userId = req.user._id;

    if (!courseId || !rating || !review) {
      return res.status(400).json({
        success: false,
        message: "Course ID, rating, and review are required",
      });
    }

    const newRatingAndReview = await RatingAndReview.create({
      user: userId,
      rating: rating,
      review: review,
    })
      .populate("user")
      .exec();

    const course = await Course.findOneAndUpdate(
      { _id: courseId },
      { $push: { ratingAndReview: newRatingAndReview } },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Rating and review created successfully",
      data: newRatingAndReview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while creating rating and review",
      error: error,
    });
  }
};

exports.getAverageRating = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const course = await Course.findById(courseId).populate("ratingAndReview");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    let totalRating = 0;
    if (course.ratingAndReview.length > 0) {
      course.ratingAndReview.forEach((ratingAndReview) => {
        totalRating += ratingAndReview.rating;
      });
      const averageRating = totalRating / course.ratingAndReview.length;

      return res.status(200).json({
        success: true,
        message: "Average rating retrieved successfully",
        data: { averageRating },
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "No ratings available for this course",
        data: { averageRating: 0 },
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while calculating average rating",
      error: error,
    });
  }
};

exports.getAllRatingAndReviews = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const ratingAndReviews = await RatingAndReview.find({ courseId: courseId })
      .populate("user")
      .exec();

    return res.status(200).json({
      success: true,
      message: "All rating and reviews retrieved successfully",
      data: ratingAndReviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while fetching rating and reviews",
      error: error,
    });
  }
};
