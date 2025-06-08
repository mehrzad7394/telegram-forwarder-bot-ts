import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import User from "../models/user.model";

const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const publicPaths = ["/api/auth", "/api/verify"];
  const isPublic = publicPaths.some((path) => req.path.startsWith(path));

  if (isPublic) next();

  const token = req.cookies.jwt;
  if (!token) {
    res.status(401).json({ error: "Unauthorized: Token missing" });
    return;
  }

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string,
    (err: VerifyErrors | null, decoded: JwtPayload | string | undefined) => {
      if (err || !decoded || typeof decoded === "string") {
        res.status(403).json({ error: "Forbidden: Invalid token" });
        return;
      }

      const username = (decoded as JwtPayload).username;

      User.findOne({ username, token })
        .then((user) => {
          if (!user) {
            res.status(403).json({ error: "Forbidden: User not found" });
            return;
          }

          (req as any).user = user;
          next();
          return;
        })
        .catch(() => {
          res.status(500).json({ error: "Internal server error" });
          return;
        });
    }
  );
};

export default verifyJWT;
