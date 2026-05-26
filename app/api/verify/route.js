import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({}, { strict: false });
const Session =
  mongoose.models.Session || mongoose.model("Session", SessionSchema, "sessions");

const IPRecordSchema = new mongoose.Schema({}, { strict: false });
const IPRecord =
  mongoose.models.IPRecord || mongoose.model("IPRecord", IPRecordSchema, "ip_records");

export async function POST(req) {
  try {
    const { token, ip_address } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "token required" }, { status: 400 });
    }

    await connectDB();

    const session = await Session.findOne({ token });

    if (!session) {
      return NextResponse.json({ error: "invalid_token" }, { status: 404 });
    }

    if (session.status === "verified") {
      return NextResponse.json({ success: true, already: true });
    }

    if (session.status === "expired" || new Date() > new Date(session.expires_at)) {
      await Session.updateOne({ token }, { $set: { status: "expired" } });
      return NextResponse.json({ error: "token_expired" }, { status: 410 });
    }

    if (session.status !== "pending") {
      return NextResponse.json({ error: "invalid_session_state" }, { status: 400 });
    }

    const clientIp = ip_address || req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

    // Check if IP is already used by a different user
    const existingIP = await IPRecord.findOne({ ip_address: clientIp });

    if (existingIP && existingIP.user_id !== String(session.user_id)) {
      await Session.updateOne({ token }, { $set: { status: "failed" } });
      return NextResponse.json({ error: "ip_conflict" }, { status: 409 });
    }

    const now = new Date();

    // Save/update IP record
    if (existingIP) {
      await IPRecord.updateOne(
        { ip_address: clientIp },
        { $set: { last_seen: now } }
      );
    } else {
      await IPRecord.create({
        ip_address: clientIp,
        user_id: String(session.user_id),
        bot_username: session.bot_username,
        first_seen: now,
        last_seen: now,
      });
    }

    // Mark session verified
    await Session.updateOne({ token }, {
      $set: {
        status: "verified",
        ip_address: clientIp,
        verified_at: now,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
