import User from "../models/user.js"
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()
const secret = process.env.JWT_SECRET
import crypto from 'crypto';
import { sendEmail } from '../services/sendMail.js';

export async function handleGetUserProfile(req, res) {
  try {
    const userId = req.query.id;
    if (!userId)
      return res.status(400).json({ message: "User ID is required" });

    const user = await User.findById(userId).select("-password");
    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "User profile loaded successfully",
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function handleLogin(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const userData = await User.findOne({ email });
    if (!userData) return res.status(400).json({ message: "User not found" });

    const isPasswordValid = await bcrypt.compare(password, userData.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid password" });

    const payload = {
      id: userData._id,
      email: userData.email,
      role: userData.role,
      name: userData.name
    };

  const token = jwt.sign(payload, secret, { expiresIn: "7d" });

    // set cookie so browser will send it on subsequent requests from the frontend
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    res.status(200).json({
      message: "User logged in successfully",
      userData: payload,
      token
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function handleSignup(req, res) {
  try {
    const { name, email, password, locality, phone, profilePicture, role } = req.body;
    if (!name || !email || !password || !locality) {
      return res.status(400).json({ message: "Please fill at least the required inputs" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const encryptedPass = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: encryptedPass,
      locality,
      phone,
      profilePicture: profilePicture || "https://www.gravatar.com/avatar/",
      role: role || "Citizen"
    });

    await newUser.save();
    res.status(200).json({ message: "User signed up successfully", newUser });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


export async function getMe(req, res){
  // accept token from cookie OR Authorization header (Bearer)
  let token = req.cookies?.token;
  if (!token) {
    const auth = req.headers?.authorization || req.headers?.Authorization;
    if (auth && auth.startsWith('Bearer ')) token = auth.split(' ')[1];
  }

  if (!token) return res.status(401).json({ message: 'Unauthorized: no token provided' });

  try {
    const decoded = jwt.verify(token, secret);
    return res.json({ id: decoded.id, name: decoded.name, email: decoded.email, role: decoded.role });
  } catch (err) {
    console.warn('getMe token verify failed', err.message || err);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export async function handleLogout(req, res) {
  try {
    // clear cookie
    res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: false });
    return res.status(200).json({ message: 'Logged out' });
  } catch (err) {
    console.error('logout error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function handleForgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hash = crypto.createHash('sha256').update(otp).digest('hex');
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    user.otpHash = hash;
    user.otpExpiry = expiry;
    await user.save();
    console.log(otp+email);
    
    const subject = 'Your OTP for password reset';
    const text = `Hello ${user.name},\n\nYour OTP for password reset is: ${otp}\nIt will expire in 15 minutes.\n\nIf you did not request this, please ignore.`;
    await sendEmail(user.email, subject, text);

    return res.status(200).json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function handleResetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: 'Email, otp and newPassword are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.otpHash || !user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP expired or not found' });
    }

    const hash = crypto.createHash('sha256').update(otp).digest('hex');
    if (hash !== user.otpHash) return res.status(400).json({ message: 'Invalid OTP' });

    const encryptedPass = await bcrypt.hash(newPassword, 10);
    user.password = encryptedPass;
    user.otpHash = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function handleChangePassword(req, res) {
  try {
    const userId = req.userData?.id;
    const { currentPassword, newPassword } = req.body;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'currentPassword and newPassword required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

