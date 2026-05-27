import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token      = searchParams.get("token");
    const user_id    = searchParams.get("user_id");
    const bot_username = searchParams.get("bot_username");

    if (!token && !user_id)
      return NextResponse.json({ error: "token or user_id required" }, { status: 400 });

    const db = await getDb();
    const sessions = db.collection("sessions");

    let session;
    if (token) {
      session = await sessions.findOne({ token });
    } else {
      const query = { user_id: String(user_id) };
      if (bot_username) query.bot_username = String(bot_username);
      session = await sessions.findOne(query, { sort: { created_at: -1 } });
    }

    if (!session)
      return NextResponse.json({ error: "Session not found" }, { status: 404 });

    return NextResponse.json({
      status:      session.status,
      user_id:     session.user_id,
      bot_username: session.bot_username,
      ip_address:  session.ip_address,
      ip_info:     session.ip_info || null,
      verified_at: session.verified_at,
      created_at:  session.created_at,
      expires_at:  session.expires_at,
    });
  } catch (err) {
    console.error("check-session error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
