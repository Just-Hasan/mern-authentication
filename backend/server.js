import express from "express";
import cors from "cors";
import { userAuthRouter } from "./routes/userAuth.js";
import { connectDB } from "./db.js";
import { User } from "./models/Users.js";
import cookieParser from "cookie-parser";

const app = express();
/**
 * Middleware to parse cookies from the request headers.
 */

app.use(cookieParser());
/**
 * Middleware to enable Cross-Origin Resource Sharing (CORS).
 * This allows the API to be consumed by the frontend.
 */

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
/**
 * Middleware to parse incoming JSON requests.
 */

app.use(express.json());

/**
 * Routes related to user authentication.
 */
app.use("/auth", userAuthRouter);

/**
 * GET route to fetch all users.
 * @route GET /
 * @returns {Array} List of users
 */
app.get("/", async function (_, res) {
  try {
    const result = await User.find();
    res.json(result);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Server Error");
  }
});

/**
 * Function to connect to the MongoDB database.
 */
connectDB();

/**
 * Start the server and listen on the specified port.
 * @param {number} process.env.PORT - The port number to listen on.
 */
app.listen(process.env.PORT, () => console.log("server is running"));
