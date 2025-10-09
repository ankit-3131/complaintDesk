import express from 'express';
const router = express.Router();
import { handleCreateTicket, getAllTickets, handleDeleteTicket, handleGetCategory, getTicketById, addTicketNote, updateTicket, markTicketResolved } from '../controllers/ticketController.js'
import checkAuth from '../middlewares/checkAuth.js';

router.route('/createTicket').post(handleCreateTicket)
router.route('/getAllTickets').get(getAllTickets)
router.route('/deleteTicket').post(checkAuth, handleDeleteTicket)
router.route('/ticket/:id/note').post(checkAuth, addTicketNote)
router.route('/ticket/:id').patch(checkAuth, updateTicket)
router.route('/ticket/:id/resolve').post(checkAuth, markTicketResolved)
router.route('/ticket/:id').get(checkAuth, getTicketById)
router.route('/getCategory').post(handleGetCategory)

export default router;