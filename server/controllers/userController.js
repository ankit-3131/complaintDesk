import User from "../models/user.js"
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()
const secret = process.env.jwtsecret

export async function handleLoadUsers(req, res){
    const currentUser = req.userData;
    const users = await User.find({_id: {$ne: currentUser._id}}).sort({ createdAt: -1 });
    res.status(200).json({ message: 'Loaded all users', allUsers: users });
}
export async function handleGetUserProfile(req, res){
    try {
        const userId = req.query.id;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User profile loaded', user: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
export async function handleLogin(req,res){
    try {
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({message: "Email and password are required"});
        }
        const userData = await User.findOne({email: email}).lean();
        if(!userData || userData.length == 0) return res.status(400).json({message: "User is not signed up"});
        
        const isPasswordValid = await bcrypt.compare(password, userData.password);
        if(!isPasswordValid) return res.status(400).json({message: "Invalid password"});

        const token = jwt.sign(userData, secret);
        res.cookie("token", token)
    
        
        res.status(200).json({message: "User logged in successfully", userData: userData, token: token});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }}

export async function handleSignup(req,res){
    try {
        const {name,email,password} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({message: "Name Email and password are required"});
        }
        const existingUser = await User.find({email:email});
        if(existingUser.length>0) return res.status(400).json({message: "Email already exists"});

        const encryptedPass = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name,
            email: email,
            password: encryptedPass,
        })
        await newUser.save();

        res.status(200).json({message: "User signed up successfully from backend", newUser: newUser});
    } catch (error) {
        console.log(error);    
}}

export async function loadSender(req, res){
    try {
        const token = req.cookies.token;
        if(!token) return res.status(401).json({message: "No token found"})
        const sender = jwt.verify(token, secret)
        return res.status(200).json({sender:sender})
    } catch (error) {
        console.log(error);
    }
} 