const express = require("express");

const UserController = require("../../controllers/user-controller");
const BiometricController = require("../../controllers/biomatric-controller");
const router = express.Router();

// User routes
router.post("/users", UserController.create);
router.post("/users/signin", UserController.signIn);

router.get("/users/:userId", UserController.getProfile);
router.put("/users/:userId/auth-method", UserController.updateAuthMethod);


// Biometric routes
router.post("/biometric/enroll/start", BiometricController.startEnrollment);
router.post("/biometric/enroll/finish", BiometricController.finishEnrollment);
router.post("/biometric/verify/start", BiometricController.startVerification);
router.post("/biometric/verify/finish", BiometricController.finishVerification);

router.get("/biometric/list", BiometricController.listBiometrics);
router.delete("/biometric/revoke/:biometricId", BiometricController.revoke);
router.get("/biometric/check-browser", BiometricController.checkBrowserCredentials);

module.exports = router;
