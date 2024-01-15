const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(500).json({
        status: false,
        message: "All fields are required",
      });
    }

    const categoryDetails = await Category.create({
      name: name,
      description: description,
    });

    return res.status(200).json({
      status: true,
      message: "Category created successfully",
      data: categoryDetails,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error while creating tag",
      error: error,
    });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const allCategories = await Category.find(
      {},
      { name: true, description: true }
    );
    return res.status(200).json({
      status: true,
      message: "All categories are fetched",
      data: allCategories,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error while fetching categories",
      error: error,
    });
  }
};
