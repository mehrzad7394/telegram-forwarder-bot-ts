import { allowedOrigins } from "../config/allowedOrigins";
import { RequestResponseNext } from "../types";

const credentials: RequestResponseNext = (req, res, next): void => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Credentials", "true");
  }
  next();
};

export default credentials;
