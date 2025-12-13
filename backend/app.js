const mongoose = require("mongoose");

let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

async function dbConnect() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATA_BASE;
  if (!uri) throw new Error("Missing MONGODB_URI (or MONGO_URI/DATA_BASE)");

  if (!cached.promise) cached.promise = mongoose.connect(uri).then((m) => m);
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = async (req, res) => {
  await dbConnect();
  const { default: app } = await import("./app.mjs");
  return app(req, res);
};
