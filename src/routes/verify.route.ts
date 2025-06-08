import { getVerified } from "../controllers/verify.controller";
import { Router } from "express";

const router = Router();

router.post("/", getVerified);

export default router;
