import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token)
      return NextResponse.json({ error: "token required" }, { status: 400 });

    const db = await getDb();
    const sessions = db.collection("sessions");

    const session = await sessions.findOne({ token });

    if (!session)
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 });

    if (session.status === "expired")
      return NextResponse.json({ error: "Session expired" }, { status: 410 });

    if (session.status === "verified")
      return NextResponse.json({ error: "Already verified" }, { status: 400 });

    if (session.expires_at && new Date() > new Date(session.expires_at))
      return NextResponse.json({ error: "Session expired" }, { status: 410 });

    // IP capture karo
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const ua = request.headers.get("user-agent") || null;

    // IP info fetch karo (free API)
    let ipInfo = {};
    try {
      const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,isp,org,proxy,hosting,query`);
      ipInfo = await res.json();
    } catch (e) {
      console.error("ip-api error:", e);
    }

    // CONFLICT CHECK — same IP, same bot_id, alag user
    const conflict = await sessions.findOne({
      bot_id:     session.bot_id,
      ip_address: ip,
      status:     "verified",
      user_id:    { $ne: session.user_id },
    });

    if (conflict) {
      await sessions.updateOne(
        { token },
        {
          $set: {
            status:        "conflict",
            ip_address:    ip,
            user_agent:    ua,
            ip_info:       ipInfo,
            conflict_with: conflict.user_id,
            verified_at:   new Date(),
          },
        }
      );

      // Conflict webhook
      if (session.webhook_conflict_url) {
        try {
          await fetch(session.webhook_conflict_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id:       session.user_id,
              bot_id:        session.bot_id,
              ip:            ip,
              conflict_with: conflict.user_id,
              ip_info:       ipInfo,
            }),
          });
        } catch (e) {
          console.error("conflict webhook error:", e);
        }
      }

      return NextResponse.json(
        {
          error:   "IP_CONFLICT",
          code:    "IP_CONFLICT",
          message: "This IP is already registered to another account.",
          ip_info: ipInfo,
        },
        { status: 409 }
      );
    }

    // SUCCESS — verify karo
    await sessions.updateOne(
      { token },
      {
        $set: {
          status:      "verified",
          ip_address:  ip,
          user_agent:  ua,
          ip_info:     ipInfo,
          verified_at: new Date(),
        },
      }
    );

    // Success webhook
    if (session.webhook_url) {
      try {
        await fetch(session.webhook_url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id:     session.user_id,
            bot_id:      session.bot_id,
            ip:          ip,
            ip_info:     ipInfo,
            verified_at: new Date().toISOString(),
          }),
        });
      } catch (e) {
        console.error("success webhook error:", e);
      }
    }

    return NextResponse.json({
      success:  true,
      user_id:  session.user_id,
      bot_id:   session.bot_id,
      ip:       ip,
      ip_info:  ipInfo,
    });
  } catch (err) {
    console.error("verify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
