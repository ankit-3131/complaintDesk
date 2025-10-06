import User from "../models/user.js"
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()
const secret = process.env.jwtsecret

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

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
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
