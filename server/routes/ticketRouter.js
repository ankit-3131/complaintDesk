import express from 'express';
const router = express.Router();
import { handleCreateTicket, getAllTickets, handleDeleteTicket } from '../controllers/ticketController.js'
import checkAuth from '../middlewares/checkAuth.js';

router.route('/createTicket').post(checkAuth, handleCreateTicket)
router.route('/getAllTickets').post(checkAuth, getAllTickets)
router.route('/deleteTicket').post(checkAuth, handleDeleteTicket)


export default router;