import { Router } from "express";
import { resetData } from "../controllers/reset.controller";

const router = Router();

router.get("/", resetData);

export default router;
