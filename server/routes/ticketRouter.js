import express from 'express';
const router = express.Router();
import { handleCreateTicket, getAllTickets, handleDeleteTicket, handleGetCategory} from '../controllers/ticketController.js'
import checkAuth from '../middlewares/checkAuth.js';

router.route('/createTicket').post(handleCreateTicket)
router.route('/getAllTickets').get(getAllTickets)
router.route('/deleteTicket').post(checkAuth, handleDeleteTicket)
router.route('/getCategory').post(handleGetCategory)

export default router;