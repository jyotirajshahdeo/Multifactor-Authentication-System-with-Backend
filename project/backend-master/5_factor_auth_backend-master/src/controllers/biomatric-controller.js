"use strict";
const BiometricService = require("../services/biomatric-service");
const biometricService = new BiometricService();

const startEnrollment = async (req, res) => {
  const { email } = req.body;

  try {
    const options = await biometricService.startEnrollment(email);
    return res.status(200).json({
      success: true,
      message: "Enrollment options generated",
      data: options,
      err: {}
    });
  } catch (error) {
    console.error("Start Enrollment Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to start biometric enrollment",
      data: {},
      err: error.message
    });
  }
};

const finishEnrollment = async (req, res) => {
  const { email, attestationResponse } = req.body;

  try {
    const result = await biometricService.finishEnrollment(email, attestationResponse);
    return res.status(200).json({
      success: true,
      message: "Biometric enrolled successfully",
      data: result,
      err: {}
    });
  } catch (error) {
    console.error("Finish Enrollment Error:", error.message);
    return res.status(400).json({
      success: false,
      message: "Failed to complete biometric enrollment",
      data: {},
      err: error.message
    });
  }
};

const startVerification = async (req, res) => {
  const { email } = req.body;

  try {
    const options = await biometricService.startVerification(email);
    return res.status(200).json({
      success: true,
      message: "Verification options generated",
      data: options,
      err: {}
    });
  } catch (error) {
    console.error("Start Verification Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to start biometric verification",
      data: {},
      err: error.message
    });
  }
};

const finishVerification = async (req, res) => {
  const { email, authenticationResponse } = req.body;

  console.log("assertionResponse in controller", authenticationResponse);

  try {
    const verified = await biometricService.finishVerification(email, authenticationResponse);
    return res.status(200).json({
      success: true,
      message: verified ? "Biometric verification successful" : "Biometric verification failed",
      data: { verified },
      err: {}
    });
  } catch (error) {
    console.error("Finish Verification Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Biometric verification failed",
      data: {},
      err: error.message
    });
  }
};

const listBiometrics = async (req, res) => {
  const { userId } = req.query;

  try {
    const data = await biometricService.listBiometrics(userId);
    return res.status(200).json({
      success: true,
      message: "Fetched biometric data successfully",
      data,
      err: {},
    });
  } catch (error) {
    console.error("List Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch biometric data",
      data: {},
      err: error.message,
    });
  }
};

const revoke = async (req, res) => {
  const { biometricId } = req.params;

  try {
    const result = await biometricService.revoke(biometricId);
    return res.status(200).json({
      success: true,
      message: "Biometric data revoked successfully",
      data: result,
      err: {},
    });
  } catch (error) {
    console.error("Revoke Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to revoke biometric data",
      data: {},
      err: error.message,
    });
  }
};

const checkBrowserCredentials = async (req, res) => {
  const { email } = req.query;

  try {
    const credentials = await biometricService.checkBrowserCredentials(email);
    return res.status(200).json({
      success: true,
      message: "Browser credentials checked successfully",
      data: credentials,
      err: {}
    });
  } catch (error) {
    console.error("Check Browser Credentials Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to check browser credentials",
      data: {},
      err: error.message
    });
  }
};

module.exports = {
  startEnrollment,
  finishEnrollment,
  startVerification,
  finishVerification,
  listBiometrics,
  revoke,
  checkBrowserCredentials
};