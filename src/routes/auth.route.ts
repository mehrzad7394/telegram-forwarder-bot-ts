import express from "express";
import { login, logout, signup } from "../controllers/login.controller";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup); 
router.post("/logout", logout);

export default router;
