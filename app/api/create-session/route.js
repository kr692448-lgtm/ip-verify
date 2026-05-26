import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";
import crypto from "crypto";

const SessionSchema = new mongoose.Schema({}, { strict: false });
const Session =
  mongoose.models.Session || mongoose.model("Session", SessionSchema, "sessions");

export async function POST(req) {
  try {
    const { user_id, bot_username } = await req.json();

    if (!user_id || !bot_username) {
      return NextResponse.json({ error: "user_id and bot_username required" }, { status: 400 });
    }

    await connectDB();

    // Expire old pending sessions for this user+bot
    await Session.updateMany(
      { user_id: String(user_id), bot_username, status: "pending" },
      { $set: { status: "expired" } }
    );

    const token = crypto.randomBytes(24).toString("hex");
    const now = new Date();
    const expires = new Date(now.getTime() + 10 * 60 * 1000); // 10 min

    await Session.create({
      token,
      user_id: String(user_id),
      bot_username,
      status: "pending",
      created_at: now,
      expires_at: expires,
    });

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    return NextResponse.json({
      success: true,
      token,
      url: `${baseUrl}/verify/${token}`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
