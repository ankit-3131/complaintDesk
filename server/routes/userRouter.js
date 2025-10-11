import express from 'express';
const router = express.Router();
import { handleGetUserProfile, handleLogin, handleSignup, getMe, handleLogout, handleForgotPassword, handleResetPassword, handleChangePassword } from '../controllers/userController.js';
import checkAuth from '../middlewares/checkAuth.js';
router.route('/load/:id').get(handleGetUserProfile)
router.route('/login').post(handleLogin)
router.route('/signup').post(handleSignup)
router.route("/me").get(getMe);
router.route('/logout').post(handleLogout);
router.route('/forgot').post(handleForgotPassword);
router.route('/reset').post(handleResetPassword);
router.route('/change-password').post(checkAuth, handleChangePassword);

export default router;