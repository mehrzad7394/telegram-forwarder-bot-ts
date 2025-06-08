import { format } from "date-fns";
import { v4 as uuid } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { RequestResponseNext } from "../types";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const logEvents = async (message: string, logName: string) => {
  const dateTime = `${format(new Date(), `yyyyMMdd\tHH:mm:ss`)}`;
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;
  try {
    const logDir = path.join(__dirname, "..", "logs");
    if (!fs.existsSync(logDir)) {
      await fs.promises.mkdir(logDir, { recursive: true });
    }

    await fs.promises.appendFile(path.join(logDir, logName), logItem);
  } catch (error) {
    console.log(`Error in logging the event: ${error}`);
  }
};

export const logger: RequestResponseNext = (req, res, next) => {
  logEvents(
    `${req?.method || null}\t${req?.headers?.origin || null}\t${
      req?.url || null
    }`,
    "reqLog.txt"
  );
  console.log(`${req?.method || null} ${req?.path || null}`);
  next();
};
