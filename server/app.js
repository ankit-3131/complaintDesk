import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { setIO, registerUserSocket, unregisterUserSocket } from './services/socketService.js';
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
const allowedOrigins = [
  "http://localhost:5173",
  "https://complaint-desk-sage.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); 
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));


export const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  }
});

setIO(io);
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId?.toString();
  registerUserSocket(userId, socket.id);
  socket.on("newMessage", (data)=>{console.log(data.content)});
  socket.on("disconnect", () => {
    unregisterUserSocket(userId);
  });
});
app.get('/', (req, res) => {
    res.send('server is running');
})

app.use('/user', userRouter);
app.use('/ticket', ticketRouter);
app.use('/api/cloudinary-upload', handleCloudinaryUpload);

import Ticket from './models/ticket.js';
import { emitToUser } from './services/socketService.js';
import User from './models/user.js';
import { sendEmail } from './services/sendMail.js';
const REOPEN_DAYS = 14;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const WARNING_DAYS = 7;
setInterval(async () => {
  try {
    const cutoff = new Date(Date.now() - REOPEN_DAYS * MS_PER_DAY);
    const toReopen = await Ticket.find({ status: 'In Progress', updatedAt: { $lt: cutoff } });
    for (const t of toReopen) {
      t.status = 'Open';
      t.timeLine.push({ status: 'Open', updatedBy: null, notes: 'Reopened: in-progress deadline exceeded' });
      await t.save();
      try {
        emitToUser(t.citizenId?.toString(), 'ticketReopened', { ticketId: t._id, title: t.title });
      } catch (e) {
        console.error('notify reopen error', e.message || e);
      }
    }
    if (toReopen.length) console.log('reopened ticketss', toReopen.map(x=>x._id));
  } catch (err) {
    console.error('reopen job error', err);
  }
}, 24 * 60 * 60 * 1000);

setInterval(async () => {
  try {
    const cutoff = new Date(Date.now() - WARNING_DAYS * MS_PER_DAY);
    const toWarn = await Ticket.find({ status: 'In Progress', inProgressSince: { $lt: cutoff }, inProgressWarningSent: false });
    for (const t of toWarn) {
      try {
        if (!t.inProgressBy) continue;
        const staff = await User.findById(t.inProgressBy).select('name email');
        if (!staff || !staff.email) continue;
        const subject = `Reminder: Ticket ${t.title} pending for over ${WARNING_DAYS} days`;
        const text = `Hello ${staff.name || ''},\n\nYou marked ticket "${t.title}" as In Progress on ${t.inProgressSince?.toLocaleString()}. It has been over ${WARNING_DAYS} days with no resolution. Please review the ticket: ${FRONTEND_URL}/ticket/${t._id}\n\nThanks.`;
        await sendEmail(staff.email, subject, text);
        t.inProgressWarningSent = true;
        await t.save();
      } catch (e) {
        console.error('warning email error', e.message || e);
      }
    }
    if (toWarn.length) console.log('Sent in-progress warnings for tickets:', toWarn.map(x=>x._id));
  } catch (err) {
    console.error('in-progress warning job error', err);
  }
}, 24 * 60 * 60 * 1000);

server.listen(PORT, ()=>{
    console.log(`Server is running at http://localhost:${PORT}`);
})