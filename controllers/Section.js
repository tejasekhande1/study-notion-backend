const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req, res) => {
  try {
    const { sectionName, courseId } = req.body;
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        error: error,
      });
    }

    const newSection = await Section.create({ sectionName });
    const updateCourseDetails = await Course.findByIdAndUpdate(
      { courseId },
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    )
      .populate("courseContent")
      .exec();

    return res.status(200).json({
      success: true,
      message: "Section created successfully",
      data: updateCourseDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while adding section",
      error: error,
    });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { newSectionName, sectionId } = req.body;
    if (!newSectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        error: error,
      });
    }

    const sectionDetails = await Section.findByIdAndUpdate(
      { sectionId },
      { sectionName: newSectionName },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
      data: sectionDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while adding section",
      error: error,
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    if (!sectionId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        error: error,
      });
    }
    const deletedSection = await Section.findById(sectionId);

    if (!deletedSection) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    await deletedSection.remove();

    const updatedCourse = await Course.findByIdAndUpdate(
      deletedSection.courseId,
      {
        $pull: {
          courseContent: sectionId,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      data: updatedCourse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while deleting section",
      error: error,
    });
  }
};
