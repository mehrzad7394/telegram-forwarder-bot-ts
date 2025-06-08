import AddToEnds from "../classes/addToEnds";
import Filters from "../classes/filters";
import End from "../models/end.model";
import Filter from "../models/filters.model";
import { RequestResponseNext } from "../types";
import createError from "../utils/createError";

export const resetData: RequestResponseNext = async (req, res, next) => {
  try {
    const ends = await End.find();
    const flts = await Filter.find();

    // if (!ends.length || !flts.length) {
    //   res.status(400).json({ message: "No data found" });
    //   return;
    // }

    const fltValues = flts.map((f) => f.value);
    const endValues = ends.map((e) => e.value);

    Filters.set(fltValues);
    AddToEnds.set(endValues);

    res.sendStatus(200);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected error occurred";
    next(createError(400, message));
  }
};
