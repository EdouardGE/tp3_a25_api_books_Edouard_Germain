const mongoose = require("mongoose");

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

module.exports = async (req, res) => {
  try {
    await dbConnect();
    const { default: app } = await import("../app.mjs");
    return app(req, res);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
