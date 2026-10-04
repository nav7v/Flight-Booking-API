import mongoose from "mongoose";

const connectDB = async () => {
  const uri =
    process.env.MONGO_URI || "mongodb://localhost:27017/flight-booking-app";
  console.log("Connecting to MongoDB");
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message || err);
  }
};

export default connectDB;
