import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    locality:{
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false
    },
    profilePicture:{
        type: String,
    },
    role:{
        type: String,
        enum: ['Citizen', 'Staff'],
        default: 'Citizen'
    }
    ,
    otpHash: { type: String },
    otpExpiry: { type: Date }
})
// module.exports = mongoose.model('User', userSchema);
const userModel = mongoose.model('User', userSchema)
export default userModel