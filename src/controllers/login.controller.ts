import createError from "../utils/createError";
import User from "../models/user.model";
import bcrypt from "bcrypt";
import { RequestResponseNext } from "../types";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
async function comparePassword(
  plaintextPassword: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(plaintextPassword, hash);
}
async function hashPassword(plaintextPassword: string): Promise<string> {
  return bcrypt.hash(plaintextPassword, 10);
}
export const login: RequestResponseNext = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!password) {
      res.status(400).json({ error: "Password is required" });
      return;
    }

    const user = await User.findOne({ username });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      res.status(403).json({ error: "Invalid login" });
      return;
    }

    const accessToken = jwt.sign(
      { username: user.username },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "1d",
      }
    );
    user.token = accessToken;
    await user.save();
    res.cookie("jwt", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    res.sendStatus(200);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected error occurred";
    next(createError(400, message));
  }
};
export const signup: RequestResponseNext = async (req, res, next) => {
  try {
    if (req.body.telegramID !== process.env.ADMIN_CHAT_ID) {
      res.status(404).json({ error: "TelegramId not found" });
      return;
    }
    const hashed = await hashPassword(req.body.password);
    const newUser = new User({
      name: req.body.name,
      lastname: req.body.name,
      username: req.body.username,
      password: hashed,
      telegramID: req.body.telegramID,
    });
    await newUser.save();
    res.sendStatus(201);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected error occurred";
    next(createError(400, message));
  }
};
export const logout: RequestResponseNext = async (req, res, next) => {
  try {
    const jwtToken = req.cookies.jwt;
    if (!jwtToken) {
      res.sendStatus(200);
      return;
    }
    const user = await User.findOne({ token: jwtToken });
    if (!user) {
      res.sendStatus(200);
      return;
    }

    jwt.verify(
      jwtToken,
      process.env.ACCESS_TOKEN_SECRET as string,
      (err: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
        if (err || typeof decoded !== "object") {
          res.sendStatus(200);
          return;
        }

        (async () => {
          if (decoded.username === user.username) {
            user.token = undefined;
            await user.save();
          }
        })();

        res.clearCookie("jwt");
        res.sendStatus(200);
        return;
      }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unexpected error occurred";
    next(createError(400, message));
  }
};
