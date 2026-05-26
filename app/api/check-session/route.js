import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({}, { strict: false });
const Session =
  mongoose.models.Session || mongoose.model("Session", SessionSchema, "sessions");

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    const bot_username = searchParams.get("bot_username");

    if (!user_id || !bot_username) {
      return NextResponse.json({ error: "user_id and bot_username required" }, { status: 400 });
    }

    await connectDB();

    // Get latest session for this user+bot
    const session = await Session.findOne(
      { user_id: String(user_id), bot_username },
      {},
      { sort: { created_at: -1 } }
    ).lean();

    if (!session) {
      return NextResponse.json({ status: "not_found" });
    }

    // Auto-expire check
    if (session.status === "pending" && new Date() > new Date(session.expires_at)) {
      await Session.updateOne({ _id: session._id }, { $set: { status: "expired" } });
      return NextResponse.json({ status: "expired" });
    }

    return NextResponse.json({
      status: session.status,
      ip_address: session.ip_address || null,
      verified_at: session.verified_at || null,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
