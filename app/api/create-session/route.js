import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const SessionSchema = new mongoose.Schema({}, { strict: false });

const Session =
  mongoose.models.Session ||
  mongoose.model("Session", SessionSchema, "sessions");

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      user_id,
      bot_username,
      bot_id,
      first_name,
      webhook_url,
      webhook_conflict_url
    } = body || {};

    if (!user_id || !bot_username) {
      return NextResponse.json(
        { error: "user_id and bot_username required" },
        { status: 400 }
      );
    }

    await connectDB();

    await Session.updateMany(
      {
        user_id: String(user_id),
        bot_username,
        status: "pending"
      },
      {
        $set: {
          status: "expired"
        }
      }
    );

    const token = crypto.randomBytes(24).toString("hex");
    const now = new Date();
    const expires = new Date(now.getTime() + 10 * 60 * 1000);

    await Session.create({
      token,
      user_id: String(user_id),
      bot_username,
      bot_id: bot_id || "",
      first_name: first_name || "",
      webhook_url: webhook_url || "",
      webhook_conflict_url: webhook_conflict_url || "",
      status: "pending",
      created_at: now,
      expires_at: expires
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    return NextResponse.json({
      success: true,
      token,
      url: `${baseUrl}/verify/${token}`
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
