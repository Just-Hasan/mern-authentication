import express from "express";
import cors from "cors";
import { userAuthRouter } from "./routes/userAuth.js";
import { connectDB } from "./db.js";
import { User } from "./models/Users.js";
import cookieParser from "cookie-parser";
const app = express();

// middleware so req can access cookies jar
app.use(cookieParser());

// middleware so that our api can be consumed by the frontend
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

// middleware to receive request.body
app.use(express.json());

// routes
app.use("/auth", userAuthRouter);

app.get("/", async function (req, res) {
  try {
    const result = await User.find();
    res.json(result);
  } catch (error) {
    console.log(error.message);
  }
});

// connection to mongoDB
connectDB();

app.listen(process.env.PORT, () => console.log("server is running"));
