import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { RequestResponseNext } from "../types";
export const getVerified: RequestResponseNext = async (req, res, next) => {
  const jwtToken = req.cookies.jwt;
  if (!jwtToken) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  jwt.verify(
    jwtToken,
    process.env.ACCESS_TOKEN_SECRET as string,
    async (
      err: VerifyErrors | null,
      decoded: JwtPayload | string | undefined
    ) => {
      if (err || !decoded || typeof decoded === "string") {
        res.status(403).json({
          error: "invalid token",
        });
        return;
      }
      try {
        const user = await User.findOne({ token: jwtToken });
        if (!user || user.username !== decoded.username) {
          res.status(403).json({ error: "Invalid token" });
          return;
        }

        res.sendStatus(200);
        return;
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
        return;
      }
    }
  );
};
