import express from 'express';
const router = express.Router();
import { handleCreateTicket, getAllTickets, handleDeleteTicket, handleGetCategory,getAllCategories, getTicketById, addTicketNote, updateTicket, markTicketResolved } from '../controllers/ticketController.js'
import checkAuth from '../middlewares/checkAuth.js';

router.route('/createTicket').post(checkAuth,handleCreateTicket)
router.route('/getAllTickets').get(getAllTickets)
router.route('/getAllCategories').get(getAllCategories)
router.route('/deleteTicket').post(checkAuth, handleDeleteTicket)
router.route('/ticket/:id/note').post(checkAuth, addTicketNote)
router.route('/ticket/:id').patch(checkAuth, updateTicket)
router.route('/ticket/:id/resolve').post(checkAuth, markTicketResolved)
router.route('/ticket/:id').get(checkAuth, getTicketById)
router.route('/getCategory').post(checkAuth, handleGetCategory)

export default router;