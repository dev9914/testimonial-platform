import mongoose from "mongoose";

let isConnected = false;

export const isDBConnected = (): boolean => isConnected;

const connectDB = async (): Promise<void> => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is not defined in environment variables. Set it in backend/.env to a MongoDB Atlas connection string."
      );
    }

    if (/<[^>]+>/.test(process.env.MONGO_URI)) {
      throw new Error(
        "MONGO_URI in backend/.env still contains <...> placeholders. Replace <username>, <password>, and <cluster> with your real MongoDB Atlas credentials."
      );
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10_000,
    });
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${(error as Error).message}`);
    isConnected = false;
    throw error;
  }
};

export default connectDB;
