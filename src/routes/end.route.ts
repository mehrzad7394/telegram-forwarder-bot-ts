import express from "express";
import { addEnd, deleteEnd, getEnds } from "../controllers/end.controller";
const router = express.Router();

router.get("/", getEnds);
router.post("/", addEnd);
router.delete("/:id", deleteEnd);

export default router;
