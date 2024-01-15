const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const { uploadToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

exports.createSubSection = async (req, res) => {
  try {
    const { sectionId, title, timeDuration, description } = req.body;
    const { video } = req.files.videoFile;

    if (!sectionId || !title || !timeDuration || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        error: error,
      });
    }

    const uploadDetails = await uploadToCloudinary(video, process.env.FOLDER);

    const subSectionDetails = await SubSection.create({
      title: title,
      timeDuration: timeDuration,
      description: description,
      videoUrl: uploadDetails.secure_url,
    });

    const sectionDetails = await Section.findByIdAndUpdate(
      { sectionId },
      {
        $push: {
          subSection: subSectionDetails._id,
        },
      },
      { new: true }
    )
      .populate("subSection")
      .exec();

    return res.status(200).json({
      status: true,
      message: "SubSection created successfully",
      data: sectionDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while creating sub section",
      error: error,
    });
  }
};

exports.deleteSubSection = async (req, res) => {
  try {
    const { subSectionId } = req.params;
    if (!subSectionId) {
      return res.status(400).json({
        success: false,
        message: "SubSection ID is required",
      });
    }

    const deletedSubSection = await SubSection.findById(subSectionId);

    if (!deletedSubSection) {
      return res.status(404).json({
        success: false,
        message: "SubSection not found",
      });
    }

    const parentSectionId = deletedSubSection.sectionId;
    await Section.findByIdAndUpdate(
      parentSectionId,
      {
        $pull: {
          subSection: subSectionId,
        },
      },
      { new: true }
    );

    await deletedSubSection.remove();

    return res.status(200).json({
      success: true,
      message: "SubSection deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while deleting sub-section",
      error: error,
    });
  }
};

exports.updateSubSection = async (req, res) => {
  try {
    const { subSectionId, title, timeDuration, description } = req.body;

    if (!subSectionId || !title || !timeDuration || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const updatedSubSection = await SubSection.findByIdAndUpdate(
      subSectionId,
      {
        title: title,
        timeDuration: timeDuration,
        description: description,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "SubSection updated successfully",
      data: updatedSubSection,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while updating sub-section",
      error: error,
    });
  }
};
