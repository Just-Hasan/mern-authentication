import dotenv from "dotenv";
import express from "express";
import { User } from "../models/Users.js";
const userAuthRouter = express.Router();
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

dotenv.config();
userAuthRouter.post("/signup", async function (req, res) {
  console.log(req.body);
  const { email, password, firstName, lastName } = req.body;
  const user = await User.findOne({ email: email });

  if (user) {
    res.json({ message: "email already existed" });
  } else {
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashPassword,
      firstName,
      lastName,
    });

    await newUser.save();
    return res.json({ status: true, message: "new user created" });
  }

  // await User.save({ email:"hasanawdwad"}); //prettier-ignore
});

userAuthRouter.post("/login", async function (req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: "user is not registered" });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.json({ message: "password is incorrect" });
  } else {
    // token generation
    const token = jwt.sign({ username: user.username }, process.env.JWT_KEY, {
      expiresIn: "1h",
    });
    res.cookie("token", token, { httpOnly: true, maxAge: 360_000 });
    return res.json({ status: true, message: "login successfull" });
  }
});

userAuthRouter.post("/forgot-password", async function (req, res) {
  const { email } = req.body;
  try {
    const isEmailExist = await User.findOne({ email });
    if (!isEmailExist) {
      return res.json({ message: "user is not registered" });
    } else {
      ////////[using nodemailer to send reset password link]
      const token = jwt.sign({ id: isEmailExist._id }, process.env.JWT_KEY, {
        expiresIn: "5m",
      });
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "iadore2code@gmail.com",
          pass: process.env.APP_PASSWORD,
        },
      });

      const mailOptions = {
        from: "iadore2code@gmail.com",
        to: email,
        subject: "Reset Password",
        text: `http://localhost:5173/resetPassword/${token}`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          res.json({
            status: true,
            message: "error sending email",
          });
        } else {
          return res.json({
            status: true,
            message: "a reset link has been sent to your email",
          });
        }
      });
    }
  } catch (error) {
    console.log(err);
  }
});

userAuthRouter.post("/reset-password/:token", async function (req, res) {
  const token = req.params.token;
  const { password } = req.body;
  try {
    const decoded = await jwt.verify(token, process.env.JWT_KEY);
    console.log(decoded);
    const id = decoded.id;
    const hashPassword = await bcrypt.hash(password, 10);
    await User.updateOne({ _id: id }, { $set: { password: hashPassword } });
    return res.json({ status: true, message: "Password updated" });
  } catch (error) {
    console.log(error);
    return res.json({ message: "invalid token" });
  }
});

const verifyUser = async function (req, res, next) {
  try {
    const token = req.cookies.token;
    console.log(token);
    if (!token) return res.json({ status: false, message: "no token" });
    const decoded = await jwt.verify(token, process.env.JWT_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.json({ status: false, message: error.message });
  }
};

userAuthRouter.get("/verify", verifyUser, function (req, res) {
  return res.json({ status: true, message: "authorized" });
});

userAuthRouter.get("/logout", async function (req, res) {
  res.clearCookie("token");
  return res.json({ status: true });
});
export { userAuthRouter };
