import express from 'express';
const router = express.Router();
import { handleCreateTicket, handleModifyTicket, handleDeleteTicket } from '../controllers/ticketController.js'
import checkAuth from '../middlewares/checkAuth.js';

router.route('/createTicket').post(checkAuth, handleCreateTicket)
router.route('/modifyTicket').post(checkAuth, handleModifyTicket)
router.route('/deleteTicket').post(checkAuth, handleDeleteTicket)


export default router;