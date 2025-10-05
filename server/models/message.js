import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true,
  },
  receiverId: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: false,
    trim: true,
  },
  seen: {
    type: Boolean,
    default: false,
    required: false,
  },
  type: {
    type: String,
    default: "Text",
    required: false,
  },
  url: {
    type: String,
    required: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true }); // adds createdAt and updatedAt

// module.exports = mongoose.model('Message', messageSchema);
const messageModel = mongoose.model('Message', messageSchema)
export default messageModel