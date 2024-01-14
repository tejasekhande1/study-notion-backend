const Tag = require("../models/Tag");

exports.createTag = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(500).json({
        status: false,
        message: "All fields are required",
      });
    }

    const tagDetails = await Tag.create({
      name: name,
      description: description,
    });

    return res.status(200).json({
      status: true,
      message: "Tag created successfully",
      data: tagDetails,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error while creating tag",
      error: error,
    });
  }
};

exports.getAllTags = async (req, res) => {
  try {
    const allTags = await Tag.find({}, { name: true, description: true });
    return res.status(200).json({
      status: true,
      message: "All tags are fetched",
      data: allTags,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error while fetching tags",
      error: error,
    });
  }
};
