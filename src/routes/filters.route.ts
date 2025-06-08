import express from "express";
import {
  addFilter,
  deleteFilter,
  getFilters,
} from "../controllers/filters.controller";

const router = express.Router();

router.get("/", getFilters);
router.post("/", addFilter);
router.delete("/:id", deleteFilter);

export default router;
