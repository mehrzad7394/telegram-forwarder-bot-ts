import createError from "../utils/createError";
import User from "../models/user.model";
import bcrypt from "bcrypt";
import { RequestResponseNext } from "../types";
async function hashPassword(plaintextPassword: string): Promise<string> {
  return bcrypt.hash(plaintextPassword, 10);
}
export const getAllUsers: RequestResponseNext = async (req, res, next) => {
  try {
    const users = await User.find({}, { token: 0, password: 0 });
    res.status(200).send(users);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected error occurred";
    next(createError(400, message));
  }
};
export const getUser: RequestResponseNext = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id, {
      token: 0,
      password: 0,
    });
    res.status(200).send(user);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected error occurred";
    next(createError(400, message));
  }
};

export const updateUser: RequestResponseNext = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      res.sendStatus(401); // Unauthorized
      return;
    }
    const user = await User.findOne({ token });
    if (!user) {
      res.sendStatus(404); // User not found
      return;
    }
    const hashed = await hashPassword(req.body.password);
    user.name = req.body.name;
    user.lastname = req.body.lastname;
    user.username = req.body.username;
    user.password = hashed;

    await user.save();

    res.sendStatus(200);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected error occurred";
    next(createError(400, message));
  }
};
export const deleteUser: RequestResponseNext = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected error occurred";
    next(createError(400, message));
  }
};
