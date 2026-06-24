/**
 * Promote an existing user to admin.
 * Usage:  npm run make-admin -- <username>
 * Example: npm run make-admin -- admin
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose, { Schema, model, models } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI not set in .env.local");

const username = process.argv[2];
if (!username) {
  console.error("Usage: npm run make-admin -- <username>");
  process.exit(1);
}

const UserSchema = new Schema({ username: String, role: String }, { strict: false });
const User = models.User ?? model("User", UserSchema);

async function main() {
  await mongoose.connect(MONGODB_URI!);
  const user = await User.findOneAndUpdate(
    { username },
    { role: "admin" },
    { new: true }
  );
  if (!user) {
    console.error(`✗ User "${username}" not found.`);
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`✓ ${user.username} is now an admin. Sign out and back in to refresh the session.`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
