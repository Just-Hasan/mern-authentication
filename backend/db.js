import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

/**
 * Connects to the MongoDB database using the connection string
 * stored in the environment variable MONGO_DB.
 * @async
 * @function connectDB
 * @returns {Promise<void>}
 * @library mongoose
 * @library dotenv
 */
async function connectDB() {
  try {
    // Connect to MongoDB using the connection string from environment variables
    const { connection } = await mongoose.connect(process.env.MONGO_DB);
    console.log(`Connected to database ${connection.name}`);
  } catch (error) {
    console.log("Failed to connect to MongoDB");
  }
}

export { connectDB };
