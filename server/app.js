import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
const PORT = 3000;
const app = express();
const server = createServer(app);
import userRouter from './routes/userRouter.js';
import ticketRouter from './routes/ticketRouter.js';
import { handleCloudinaryUpload } from './controllers/handleCloudinaryUpload.js';
import connectDB from './lib/configDB.js';
import cookieParser from 'cookie-parser';
// Connect to MongoDB
connectDB();

app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
  }))

export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }});

export const userIdSocketIdMap = {}

io.on("connection", (socket) => {
  // console.log(socket.handshake.query.userData._id);
  
    const userId = socket.handshake.query.userId;
    userIdSocketIdMap[userId] = socket.id;
    socket.on("newMessage", (data)=>{console.log(data.content)});
    io.on("connection", (socket) => {
  // console.log("Socket connected:", socket.id, socket.handshake.query.userId);
});
    socket.on("disconnect", () => {
        // console.log("A user disconnected");
        delete userIdSocketIdMap[userId];
    });
});
app.get('/', (req, res) => {
    res.send('Home');
})

app.use('/user', userRouter);
app.use('/ticket', ticketRouter);
// app.use('/api/cloudinary-upload', handleCloudinaryUpload);

server.listen(PORT, ()=>{
    console.log(`Server is running at http://localhost:${PORT}`);
})