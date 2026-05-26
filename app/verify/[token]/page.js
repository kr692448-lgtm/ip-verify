import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";
import VerifyClient from "./VerifyClient";

const SessionSchema = new mongoose.Schema({}, { strict: false });
const Session =
  mongoose.models.Session || mongoose.model("Session", SessionSchema, "sessions");

export default async function VerifyPage({ params }) {
  const { token } = params;

  await connectDB();
  const session = await Session.findOne({ token }).lean();

  if (!session) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0f",
        fontFamily: "'Courier New', monospace",
        color: "#ff4444",
        textAlign: "center",
      }}>
        <div>
          <div style={{ fontSize: "3rem" }}>❌</div>
          <h2 style={{ letterSpacing: "0.15em" }}>INVALID TOKEN</h2>
          <p style={{ color: "#555", fontSize: "0.8rem" }}>Link expired or invalid.</p>
        </div>
      </div>
    );
  }

  if (session.status === "verified") {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0f",
        fontFamily: "'Courier New', monospace",
        color: "#00ff88",
        textAlign: "center",
      }}>
        <div>
          <div style={{ fontSize: "3rem" }}>✅</div>
          <h2 style={{ letterSpacing: "0.15em" }}>ALREADY VERIFIED</h2>
          <p style={{ color: "#555", fontSize: "0.8rem" }}>IP already verified for this session.</p>
        </div>
      </div>
    );
  }

  if (session.status === "expired") {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0f",
        fontFamily: "'Courier New', monospace",
        color: "#ffaa00",
        textAlign: "center",
      }}>
        <div>
          <div style={{ fontSize: "3rem" }}>⏰</div>
          <h2 style={{ letterSpacing: "0.15em" }}>LINK EXPIRED</h2>
          <p style={{ color: "#555", fontSize: "0.8rem" }}>Generate a new link from bot.</p>
        </div>
      </div>
    );
  }

  return (
    <VerifyClient
      token={token}
      botUsername={session.bot_username}
    />
  );
}
