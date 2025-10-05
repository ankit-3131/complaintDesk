import Message from '../models/message.js';
import { userIdSocketIdMap } from '../app.js';
import { io } from '../app.js';
export async function handleLoadMessages(req,res){
    const {senderId, receiverId } = req.params;
    try {
        const messages = await Message.find({
            $or: [
                {senderId:senderId, receiverId:receiverId},
                {receiverId: senderId, senderId: receiverId}
            ]
        });
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error loading messages:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function handleSendMessage(req,res){
    const {content, senderId, receiverId} = req.body;
    console.log(userIdSocketIdMap);
    const messageDetails = req.body;
    const receiverSocketId = userIdSocketIdMap[receiverId];
    
    try {
        const msg = new Message(messageDetails);
        res.status(200).json(messageDetails); 
        await msg.save();
        console.log("Emitting to socket:", receiverSocketId, "for user:", receiverId);
        io.to(receiverSocketId).emit("newMessage", messageDetails);
        // console.log("sender inside send message bakcend", senderId);
        // console.log("message sent from sokcet backend");
    } catch (error) {
        console.log(error);    
    }
}