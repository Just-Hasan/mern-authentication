import dotenv from "dotenv";
import express from "express";
import { User } from "../models/Users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// Load environment variables from .env file
dotenv.config();

// Create a new Express Router instance
const userAuthRouter = express.Router();

/**
 * Route to handle user signup.
 * @route POST /signup
 * @param {string} req.body.email - User's email address.
 * @param {string} req.body.password - User's password.
 * @param {string} req.body.firstName - User's first name.
 * @param {string} req.body.lastName - User's last name.
 * @returns {Object} Response object with status and message.
 * @library bcrypt
 * @library express
 */

userAuthRouter.post("/signup", async function (req, res) {
  const { email, password, firstName, lastName } = req.body;
  const user = await User.findOne({ email: email });

  if (user) {
    res.json({ message: "Email already exists" });
  } else {
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashPassword,
      firstName,
      lastName,
    });

    await newUser.save();
    return res.json({ status: true, message: "New user created" });
  }
});

/**
 * Route to handle user login.
 * @route POST /login
 * @param {string} req.body.email - User's email address.
 * @param {string} req.body.password - User's password.
 * @returns {Object} Response object with status and message.
 * @library bcrypt
 * @library jwt
 * @library express
 */
userAuthRouter.post("/login", async function (req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: "User is not registered" });
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return res.json({ message: "Password is incorrect" });
  } else {
    // Token generation
    const token = jwt.sign({ username: user.username }, process.env.JWT_KEY, {
      expiresIn: "1h",
    });
    res.cookie("token", token, { httpOnly: true, maxAge: 360000 });
    return res.json({ status: true, message: "Login successful" });
  }
});

/**
 * Route to handle forgot password functionality.
 * @route POST /forgot-password
 * @param {string} req.body.email - User's email address.
 * @returns {Object} Response object with status and message.
 * @library nodemailer
 * @library jwt
 * @library express
 */
userAuthRouter.post("/forgot-password", async function (req, res) {
  const { email } = req.body;
  try {
    const isEmailExist = await User.findOne({ email });
    if (!isEmailExist) {
      return res.json({ message: "User is not registered" });
    } else {
      // Using nodemailer to send reset password link
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
            message: "Error sending email",
          });
        } else {
          return res.json({
            status: true,
            message: "A reset link has been sent to your email",
          });
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
});

/**
 * Route to handle reset password functionality.
 * @route POST /reset-password/:token
 * @param {string} req.params.token - JWT token for user verification.
 * @param {string} req.body.password - New user password.
 * @returns {Object} Response object with status and message.
 * @library bcrypt
 * @library jwt
 * @library express
 */
userAuthRouter.post("/reset-password/:token", async function (req, res) {
  const token = req.params.token;
  const { password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    console.log(decoded);
    const id = decoded.id;
    const hashPassword = await bcrypt.hash(password, 10);
    await User.updateOne({ _id: id }, { $set: { password: hashPassword } });
    return res.json({ status: true, message: "Password updated" });
  } catch (error) {
    console.log(error);
    return res.json({ message: "Invalid token" });
  }
});

/**
 * Middleware to verify user authentication based on JWT token.
 * @function verifyUser
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @library jwt
 * @library express
 */
const verifyUser = async function (req, res, next) {
  try {
    const token = req.cookies.token;
    console.log(token);
    if (!token) return res.json({ status: false, message: "No token" });
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.json({ status: false, message: error.message });
  }
};

/**
 * Route to verify user authentication.
 * @route GET /verify
 * @middleware verifyUser
 * @returns {Object} Response object with status and message.
 * @library express
 */
userAuthRouter.get("/verify", verifyUser, function (req, res) {
  return res.json({ status: true, message: "Authorized" });
});

/**
 * Route to handle user logout.
 * @route GET /logout
 * @returns {Object} Response object with status and message.
 * @library express
 */
userAuthRouter.get("/logout", async function (req, res) {
  res.clearCookie("token");
  return res.json({ status: true });
});

// Export the user authentication router
export { userAuthRouter };
