import express from 'express';
const router = express.Router();
import { handleGetUserProfile, handleLogin, handleSignup, getMe, handleLogout } from '../controllers/userController.js';

router.route('/load/:id').get(handleGetUserProfile)
router.route('/login').post(handleLogin)
router.route('/signup').post(handleSignup)
router.route("/me").get(getMe);
router.route('/logout').post(handleLogout);

export default router;