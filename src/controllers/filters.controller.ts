import filters from "../classes/filters";
import Filter from "../models/filters.model";
import createError from "../utils/createError";
import { RequestResponseNext } from "../types";

export const deleteFilter: RequestResponseNext = async (req, res, next) => {
  try {
    const found = await Filter.findByIdAndDelete(req.params.id);
    if (!found) {
      return next(createError(404, "Filter not found"));
    }
    filters.removeByValue(found.value);
    res.sendStatus(200);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected error occurred";
    next(createError(400, message));
  }
};
export const getFilters: RequestResponseNext = async (req, res, next) => {
  try {
    const flts = await Filter.find();
    res.status(201).send(flts);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected error occurred";
    next(createError(400, message));
  }
};
export const addFilter: RequestResponseNext = async (req, res, next) => {
  try {
    const newFilter = new Filter({
      value: req.body.value,
    });

    const savedFilter = await newFilter.save();
    filters.addValue(savedFilter.value);
    res.status(201).send(savedFilter);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected error occurred";
    next(createError(400, message));
  }
};
