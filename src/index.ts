// libraries
import express from "express";
import dotenv from "dotenv";
import { Context, Telegraf } from "telegraf";
import mongoose from "mongoose";
import { message } from "telegraf/filters";
import cors from "cors";
import cookieParser from "cookie-parser";

// Routes
import filterRoute from "./routes/filters.route";
import endRoute from "./routes/end.route";
import resetRoute from "./routes/reset.route";
import userRoute from "./routes/user.route";
import authRoute from "./routes/auth.route";
import verifyRoute from "./routes/verify.route";

// Models
import Filter from "./models/filters.model";
import End from "./models/end.model";

// Classes / Helpers / Utilities
import { urlRegex, mentionRegex } from "./cases";
import Queue from "./classes/queue";
import addToEnds from "./classes/addToEnds";
import filters from "./classes/filters";

// 🔧 Configs
import corsOptions from "./config/corsOptions";

// 🧩 Middleware
import { logger } from "./middleware/logEvents";
import errorHandler from "./middleware/errorHandler";
import verifyJWT from "./middleware/verifyJWT";
import credentials from "./middleware/credentials";

const PORT = process.env.PORT || 5000;
const app = express();
dotenv.config();

//Message Queue
const queue = new Queue();
if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN environment variable is not set.");
}
const bot = new Telegraf(process.env.BOT_TOKEN);
let botCTX: Context | null = null;
let receiverChannelId: string | number | null = null;
// custom middleware logger
app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

//Routes
app.use("/api/auth", authRoute);
app.use("/api/verify", verifyRoute);
app.use(verifyJWT);
// app.use("/api/home", homeRoute);
app.use("/api/filters", filterRoute);
app.use("/api/end", endRoute);
app.use("/api/reset", resetRoute);
app.use("/api/user", userRoute);

//mongoose connection
mongoose.set("strictQuery", true);

const connect = async () => {
  try {
    if (!process.env.MONGO) {
      throw new Error("MONGO environment variable is not set.");
    }
    await mongoose.connect(process.env.MONGO);

    // bot.launch();
    console.log("Connected to mongoDB!");
  } catch (error) {
    console.log(error);
  }
};

const handleFilter = async (text: string): Promise<string> => {
  const filterArray = filters.getAll();

  if (filterArray.length === 0) return text;

  const lowerFilters = filterArray.map((f) => f.toLowerCase());

  const filteredText = text
    .split("\n")
    .filter((line) =>
      lowerFilters.every((f) => !line.toLowerCase().includes(f))
    )
    .join("\n");

  return filteredText;
};
const handleRemoveURL = async (text: string): Promise<string> => {
  return text
    .split("\n")
    .filter((line) => {
      return (
        !urlRegex.test(line.toLowerCase()) &&
        !mentionRegex.test(line.toLowerCase())
      );
    })
    .join("\n");
};
const addToLast = async (text: string): Promise<string> => {
  let modifiedText = text;
  const endArray = addToEnds.getAll();
  if (endArray.length === 0) return text;
  for (const endText of endArray) {
    modifiedText = modifiedText.split("\n").concat(endText).join("\n");
  }
  return modifiedText;
};

const runInterval = async (): Promise<void> => {
  const interval: NodeJS.Timeout = setInterval(async () => {
    if (!queue.isEmpty()) {
      try {
        const frontNode = queue.front();
        if (!receiverChannelId || !frontNode) return;

        await botCTX?.telegram?.sendMessage(
          receiverChannelId,
          frontNode.message
        );
        queue?.dequeue();
      } catch (error: any) {
        clearInterval(interval);
        const retryAfter = error?.response?.parameters?.retry_after;
        const delay = retryAfter ? retryAfter * 1000 : 30000;
        setTimeout(() => {
          runInterval();
        }, delay);
      }
    }
  }, 2000);
};
runInterval();

// bot configs
bot.start(async (ctx) => {
  botCTX = ctx;
  const foundFilters = await Filter.find();
  const flt = foundFilters.map((f) => f.value);
  filters.set(flt);
  const ends = await End.find();
  const addToTheLast = ends.map((f) => f.value);
  addToEnds.set(addToTheLast);
  ctx.reply(
    "👋 Bot is started!\nPlease forward a post from your channel so I can grab the channel ID."
  );
});
bot.command("stop", (ctx) => {
  // Reset all relevant data
  receiverChannelId = null;
  botCTX = null;
  // Clear filters and ends
  filters.set([]);
  addToEnds.set([]);
  ctx.reply("🛑 Bot has been reset. Send /start to begin again.");
});
bot.on(message("text"), async (ctx) => {
  const userId = ctx.message.from.id.toString();
  if (userId !== process.env.ADMIN_CHAT_ID) {
    ctx.reply("⚠️ Only bot admin can send message.");
    return;
  }
  // Require /start first
  if (!botCTX) {
    ctx.reply("⚠️ Please send /start to begin.");
    return;
  }
  // Step 1: Get Channel ID if not already set
  if (!receiverChannelId && ctx.message.forward_from_chat) {
    receiverChannelId = ctx.message.forward_from_chat.id;
    ctx.reply(
      `✅ Got the channel ID: ${receiverChannelId}\nNow just send me messages and I’ll forward them to your channel.`
    );
    return;
  }
  // Step 2: Only continue if channel ID is known
  if (!receiverChannelId) {
    ctx.reply("⚠️ Please forward a post from your channel first.");
    return;
  }
  // Step 3: Process message and queue it
  if (ctx.message.text && userId === process.env.ADMIN_CHAT_ID) {
    botCTX = ctx;
    const removeUrl = await handleRemoveURL(ctx.message.text);

    const filteredMessage = await handleFilter(removeUrl);

    const finalMessage = await addToLast(filteredMessage);

    await queue.enqueue({ message: finalMessage });
  }
});

app.use(errorHandler);
app.listen(PORT, () => {
  connect();
  console.log(`Server running on port ${PORT}`);
});
