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
        default: "https://www.gravatar.com/avatar/"
    },
    role:{
        type: String,
        enum: ['Citizen', 'Staff']
    }
})
// module.exports = mongoose.model('User', userSchema);
const userModel = mongoose.model('User', userSchema)
export default userModel