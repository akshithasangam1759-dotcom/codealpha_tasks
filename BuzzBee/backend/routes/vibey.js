import express from "express";
import { vibeyChat } from "../controllers/vibeyController.js";

const router = express.Router();

router.post("/chat", vibeyChat);

export default router;