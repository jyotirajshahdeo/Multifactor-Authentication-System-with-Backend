"use strict";
const UserService = require("../services/user-service");
const userService = new UserService();

const create = async (req, res) => {
  try {
    const response = await userService.create(req.body);
    return res.status(201).json({
      success: true,
      message: "Successfully created a new user",
      data: response,
      err: {},
    });
  } catch (error) {
    console.error("Create User Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating user",
      data: {},
      err: error.message,
    });
  }
};

const signIn = async (req, res) => {
  const { email, factorType, factorValue } = req.body;

  try {
    const result = await userService.signIn(email, factorType, factorValue);
    return res.status(200).json({
      success: true,
      message: "Sign-in successful",
      data: result,
      err: {},
    });
  } catch (error) {
    console.error("Sign-in Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
      data: {},
      err: error.message,
    });
  }
};

const getProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const profile = await userService.getProfile(userId);
    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: profile,
      err: {},
    });
  } catch (error) {
    console.error("Profile Fetch Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      data: {},
      err: error.message,
    });
  }
};

const updateAuthMethod = async (req, res) => {
  const { userId } = req.params;
  const { newMethod } = req.body;

  try {
    const updatedUser = await userService.updateAuthMethod(userId, newMethod);
    return res.status(200).json({
      success: true,
      message: "Authentication method updated successfully",
      data: updatedUser,
      err: {},
    });
  } catch (error) {
    console.error("Update Auth Method Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update authentication method",
      data: {},
      err: error.message,
    });
  }
};

module.exports = {
  create,
  signIn,
  getProfile,
  updateAuthMethod,
};