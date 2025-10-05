import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const uri = process.env.MONGO_STRING;

export default async function connectDB(){
    try{
        await mongoose.connect(uri);
        console.log("Databse is Connected...!");
    }
    catch(error){
        console.log("Database Error", error);
    }
}