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

    const courseDetails = await Course.findOne({
      _id: courseId,
      studentEnrolled: { $elemMatch: { $eq: userId } },
    });

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: "User not enrolled this course",
      });
    }

    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });

    if (!alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "Course already reviewed",
      });
    }

    const newRatingAndReview = await RatingAndReview.create({
      user: userId,
      rating: rating,
      review: review,
      course: courseId,
    });

    await Course.findOneAndUpdate(
      { _id: courseId },
      { $push: { ratingAndReview: newRatingAndReview._id } },
      { new: true }
    );

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

    const result = await RatingAndReview.aggregate([
      { $match: { course: new mongoose.Types.ObjectId(courseId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    if (result.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No ratings available for this course",
        data: { averageRating: 0 },
      });
    }

    const averageRating = result[0].averageRating;

    return res.status(200).json({
      success: true,
      message: "Average rating retrieved successfully",
      data: { averageRating },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while calculating average rating",
      error: error,
    });
  }
};

exports.getAllRatingAndReviewsByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const ratingAndReviews = await RatingAndReview.find({ courseId: courseId })
      .populate({
        path: "user",
        select: "firstname lastname email",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
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

exports.getAllRatingAndReviews = async (req, res) => {
  try {
    const ratingAndReviews = await RatingAndReview.find({})
      .populate({
        path: "user",
        select: "firstname lastname email",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
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
