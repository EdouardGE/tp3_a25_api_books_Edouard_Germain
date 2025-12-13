import app from "../app.mjs";
import mongoose from "mongoose";

let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const uri =
      process.env.MONGODB_URI ??
      process.env.MONGO_URI ??
      "mongodb://localhost:27017/etcaetera";

    cached.promise = mongoose.connect(uri).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default async function handler(req, res) {
  try {
    await dbConnect();
    return app(req, res);
  } catch (err) {
    console.error("DB connection error:", err);
    return res.status(500).json({ message: "DB connection error" });
  }
}
