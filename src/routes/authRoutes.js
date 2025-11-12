import express from "express";
import UserController from "../controller/authController/userController.js";
import { verifyToken } from "../middleware/authMiddleware/userMiddleware.js";
import ForgotPasswordController from "../controller/authController/forgotPasswordController.js";


const router = express.Router();

router.post("/register", UserController.registerUser);
router.post("/login", UserController.loginUser);
router.post("/logout", verifyToken, UserController.logoutUser);


router.post("/forgot-password/send-otp", ForgotPasswordController.sendOTP);
router.post("/forgot-password/verify-otp", ForgotPasswordController.verifyOTP);
router.post("/forgot-password/reset", ForgotPasswordController.resetPassword);

export default router;
