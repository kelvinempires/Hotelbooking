import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Database connected successfully");

    // Add event listeners for better monitoring
    mongoose.connection.on("error", (err) => {
      console.log("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("🟡 MongoDB disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("🟡 MongoDB connection closed");
      process.exit(0);
    });

    return mongoose.connection;
  } catch (error) {
    console.log("❌ Error while connecting to database", error);
    process.exit(1);
  }
};

export default connectMongoDB;
