import express from 'express';
const router = express.Router();
import { handleGetUserProfile, handleLogin, handleSignup} from '../controllers/userController.js';

router.route('/load/:id').get(handleGetUserProfile)
router.route('/login').post(handleLogin)
router.route('/signup').post(handleSignup)


export default router;