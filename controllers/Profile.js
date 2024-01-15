const User = require("../models/User");
const Profile = require("../models/Profile");

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { gender, dateOfBirth, about, contactNumber } = req.body;

    if (!userId || !gender || !dateOfBirth || !about || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const userDetails = await User.findById(userId);

    const updatedProfile = await Profile.findOneAndUpdate(
      { _id: userDetails.additionalDetails },
      {
        gender: gender,
        dateOfBirth: dateOfBirth,
        about: about,
        contactNumber: contactNumber,
      },
      { new: true }
    );

    if (!updatedProfile) {
      const newProfile = new Profile({
        _id: userId,
        gender: gender,
        dateOfBirth: dateOfBirth,
        about: about,
        contactNumber: contactNumber,
      });

      await newProfile.save();
    }

    await User.findByIdAndUpdate(
      userId,
      { $set: { additionalDetails: updatedProfile._id } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while updating profile",
      error: error,
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const deletedUser = await User.findByIdAndDelete({ _id: userId });

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const deletedProfile = await Profile.findByIdAndDelete({
      _id: deletedUser.additionalDetails,
    });

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
      data: { deletedUser, deletedProfile },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while deleting account",
      error: error,
    });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming you have user information in the request (e.g., from authentication middleware)

    // Retrieve the user with their associated profile details
    const userDetails = await User.findById(userId)
      .populate("additionalDetails")
      .exec();

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User details retrieved successfully",
      data: userDetails,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error while fetching user details",
      error: error,
    });
  }
};
