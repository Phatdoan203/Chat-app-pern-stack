import express from 'express';
import protectRoute from '../middleware/protectRoute.js';
import { sendMessage, getMessages, getUsersForSideBar} from '../controllers/message.controller.js';

const router = express.Router();

router.get("/conversation", protectRoute, getUsersForSideBar)

router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);

export default router;