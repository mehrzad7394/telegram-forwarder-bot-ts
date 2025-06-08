import addToEnds from "../classes/addToEnds";
import End from "../models/end.model";
import createError from "../utils/createError";
import { RequestResponse, RequestResponseNext } from "../types";
export const deleteEnd: RequestResponseNext = async (req, res, next) => {
  try {
    const found = await End.findByIdAndDelete(req.params.id);
    if (!found) {
      return next(createError(404, "Filter not found"));
    }
    addToEnds.removeByValue(found.value);
    res.status(200);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected error occurred";
    next(createError(400, message));
  }
};
export const getEnds: RequestResponse = async (req, res) => {
  const Ends = await End.find();
  res.status(200).send(Ends);
};
export const addEnd: RequestResponseNext = async (req, res, next) => {
  try {
    const newEnd = new End({
      value: req.body.value,
    });

    const savedEnd = await newEnd.save();
    addToEnds.addValue(savedEnd.value);
    res.status(201).send(savedEnd);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected error occurred";
    next(createError(400, message));
  }
};
