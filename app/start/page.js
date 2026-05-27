import { redirect } from "next/navigation";
import { getDb } from "../../lib/mongodb";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export default async function StartPage({ searchParams }) {
  const user_id    = searchParams?.user_id;
  const bot        = searchParams?.bot;
  const bot_id     = searchParams?.bot_id;
  const first_name = searchParams?.first_name;

  if (!user_id || !bot || !bot_id) redirect("/");

  const db = await getDb();
  const sessions = db.collection("sessions");

  await sessions.updateMany(
    { user_id: String(user_id), bot_id: String(bot_id), status: "pending" },
    { $set: { status: "expired" } }
  );

  const token = crypto.randomBytes(24).toString("hex");

  await sessions.insertOne({
    token,
    user_id:      String(user_id),
    first_name:   first_name ? String(first_name) : null,
    bot_username: String(bot),
    bot_id:       String(bot_id),
    webhook_url:  null,
    webhook_conflict_url: null,
    status:       "pending",
    created_at:   new Date(),
    expires_at:   new Date(Date.now() + 10 * 60 * 1000),
    ip_address:   null,
    user_agent:   null,
    verified_at:  null,
  });

  redirect(`/verify/${token}`);
}
