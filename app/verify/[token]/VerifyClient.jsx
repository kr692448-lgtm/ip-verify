"use client";

import { useState, useEffect, useRef } from "react";

// ─── Animated background grid ───────────────────────────────────────────────
function GridBg() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0,
      backgroundImage: `
        linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)
      `,
      backgroundSize: "40px 40px",
      animation: "gridMove 20s linear infinite",
    }} />
  );
}

// ─── Scanning line animation ─────────────────────────────────────────────────
function ScanLine() {
  return (
    <div style={{
      position: "fixed", left: 0, right: 0,
      height: "2px",
      background: "linear-gradient(90deg, transparent, #00ff88, transparent)",
      zIndex: 1,
      animation: "scanLine 3s linear infinite",
      opacity: 0.6,
    }} />
  );
}

// ─── IP Ring Animation ───────────────────────────────────────────────────────
function IPRing({ status }) {
  const color = status === "verifying"
    ? "#00ff88"
    : status === "success"
    ? "#00ff88"
    : status === "blocked"
    ? "#ff4444"
    : "#444";

  const rings = [80, 100, 120];

  return (
    <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto" }}>
      {rings.map((size, i) => (
        <div key={i} style={{
          position: "absolute",
          top: "50%", left: "50%",
          width: size, height: size,
          transform: "translate(-50%, -50%)",
          border: `1px solid ${color}`,
          borderRadius: "50%",
          opacity: status === "idle" ? 0.2 : 0.15 + i * 0.1,
          animation: status === "verifying"
            ? `pulse ${1.2 + i * 0.4}s ease-in-out infinite`
            : status === "success"
            ? `successPulse 0.6s ease-out ${i * 0.1}s forwards`
            : "none",
          transition: "border-color 0.5s ease",
        }} />
      ))}
      {/* Center icon */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        fontSize: "2.2rem",
        filter: status === "verifying" ? `drop-shadow(0 0 8px ${color})` : "none",
        animation: status === "verifying" ? "iconFloat 2s ease-in-out infinite" : "none",
        transition: "filter 0.5s ease",
      }}>
        {status === "success" ? "✅" : status === "blocked" ? "🚫" : "🌐"}
      </div>
    </div>
  );
}

// ─── Terminal-style log lines ────────────────────────────────────────────────
function LogLine({ text, delay = 0, color = "#00ff88" }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateX(0)" : "translateX(-10px)",
      transition: "all 0.4s ease",
      color,
      fontSize: "0.72rem",
      fontFamily: "'Courier New', monospace",
      lineHeight: "1.8",
      letterSpacing: "0.05em",
    }}>
      <span style={{ color: "#555", marginRight: "0.5rem" }}>›</span>
      {text}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function VerifyClient({ token, botUsername }) {
  const [status, setStatus] = useState("idle"); // idle | verifying | success | blocked | error
  const [logs, setLogs] = useState([]);
  const [ipDisplay, setIpDisplay] = useState("...");
  const [idDisplay, setIdDisplay] = useState("...");
  const [errorMsg, setErrorMsg] = useState("");
  const hasRun = useRef(false);

  const addLog = (text, color = "#00ff88", delay = 0) => {
    setTimeout(() => {
      setLogs(prev => [...prev, { text, color, id: Date.now() + Math.random() }]);
    }, delay);
  };

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const run = async () => {
      setStatus("verifying");

      addLog("Initializing NxtZen IP Verification...", "#00ff88", 0);
      addLog("Connecting to secure endpoint...", "#888", 300);
      addLog("Fetching IP address...", "#888", 700);

      await new Promise(r => setTimeout(r, 1200));

      let clientIp = "unknown";
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipRes.json();
        clientIp = ipData.ip;
      } catch (_) {}

      // Generate a short session ID display
      const shortId = token.substring(0, 8).toUpperCase();
      setIpDisplay(clientIp);
      setIdDisplay(shortId);

      addLog(`IP Address detected: ${clientIp}`, "#00ffcc", 0);
      addLog(`Session ID: ${shortId}...`, "#888", 200);
      addLog("Scanning for IP conflicts...", "#888", 500);
      addLog("Checking geo-location...", "#888", 900);
      addLog("Verifying identity...", "#888", 1300);

      await new Promise(r => setTimeout(r, 2000));

      try {
        const res = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, ip_address: clientIp }),
        });
        const data = await res.json();

        if (data.success) {
          addLog("IP verification complete ✓", "#00ff88", 0);
          addLog("Identity confirmed ✓", "#00ff88", 200);
          addLog("Access granted.", "#00ff88", 500);
          setStatus("success");
          setTimeout(() => {
            if (botUsername) {
              window.location.href = `https://t.me/${botUsername}`;
            }
          }, 2500);
        } else if (data.error === "ip_conflict") {
          addLog("⚠ IP conflict detected!", "#ff4444", 0);
          addLog("This IP is registered to another user.", "#ff4444", 300);
          addLog("Access DENIED.", "#ff4444", 600);
          setErrorMsg("This IP address is already linked to a different account.");
          setStatus("blocked");
        } else {
          addLog(`Error: ${data.error || "verification failed"}`, "#ff4444", 0);
          setErrorMsg(data.error || "Verification failed. Try again.");
          setStatus("error");
        }
      } catch (err) {
        addLog("Network error during verification.", "#ff4444", 0);
        setErrorMsg("Network error. Please try again.");
        setStatus("error");
      }
    };

    run();
  }, []);

  const statusColor = status === "blocked" || status === "error" ? "#ff4444" : "#00ff88";
  const statusText = {
    idle: "INITIALIZING",
    verifying: "VERIFYING IP",
    success: "VERIFIED",
    blocked: "ACCESS DENIED",
    error: "ERROR",
  }[status] || "PROCESSING";

  return (
    <>
      <style>{`
        @keyframes gridMove {
          0% { backgroundPosition: 0 0; }
          100% { backgroundPosition: 40px 40px; }
        }
        @keyframes scanLine {
          0% { top: -2px; }
          100% { top: 100vh; }
        }
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(1.08); opacity: 0.7; }
        }
        @keyframes successPulse {
          0% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
        }
        @keyframes iconFloat {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-4px); }
        }
        @keyframes glitch {
          0% { clip-path: inset(40% 0 61% 0); transform: translate(-2px); }
          20% { clip-path: inset(92% 0 1% 0); transform: translate(2px); }
          40% { clip-path: inset(43% 0 1% 0); transform: translate(1px); }
          60% { clip-path: inset(25% 0 58% 0); transform: translate(-1px); }
          80% { clip-path: inset(54% 0 7% 0); transform: translate(2px); }
          100% { clip-path: inset(58% 0 43% 0); transform: translate(-2px); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .nxtzen-card {
          animation: fadeUp 0.6s ease forwards;
        }
      `}</style>

      <GridBg />
      <ScanLine />

      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        position: "relative",
        zIndex: 2,
        fontFamily: "'Courier New', monospace",
      }}>
        <div className="nxtzen-card" style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(10,10,20,0.95)",
          border: `1px solid ${statusColor}22`,
          borderRadius: "2px",
          overflow: "hidden",
          boxShadow: `0 0 40px ${statusColor}15, 0 0 80px ${statusColor}08`,
        }}>
          {/* Header bar */}
          <div style={{
            background: `${statusColor}0d`,
            borderBottom: `1px solid ${statusColor}22`,
            padding: "0.8rem 1.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: statusColor,
                boxShadow: `0 0 6px ${statusColor}`,
                animation: status === "verifying" ? "blink 1s ease infinite" : "none",
              }} />
              <span style={{ color: statusColor, fontSize: "0.7rem", letterSpacing: "0.2em", fontWeight: "bold" }}>
                NXTZEN // IP-VERIFY
              </span>
            </div>
            <span style={{ color: "#333", fontSize: "0.6rem", letterSpacing: "0.1em" }}>
              v2.0
            </span>
          </div>

          {/* Body */}
          <div style={{ padding: "2rem 1.5rem" }}>
            {/* IP Ring */}
            <IPRing status={status} />

            {/* Status label */}
            <div style={{
              textAlign: "center",
              marginTop: "1.5rem",
              marginBottom: "0.5rem",
            }}>
              <div style={{
                color: statusColor,
                fontSize: "0.8rem",
                letterSpacing: "0.3em",
                fontWeight: "bold",
              }}>
                {statusText}
                {status === "verifying" && (
                  <span style={{ animation: "blink 0.8s step-end infinite" }}>_</span>
                )}
              </div>
            </div>

            {/* IP / ID display */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.5rem",
              margin: "1.2rem 0",
            }}>
              {[
                { label: "IP ADDRESS", val: ipDisplay },
                { label: "SESSION ID", val: idDisplay },
              ].map(({ label, val }) => (
                <div key={label} style={{
                  background: "#0d0d18",
                  border: "1px solid #1a1a2e",
                  borderRadius: "2px",
                  padding: "0.6rem 0.8rem",
                }}>
                  <div style={{ color: "#444", fontSize: "0.55rem", letterSpacing: "0.15em", marginBottom: "0.3rem" }}>
                    {label}
                  </div>
                  <div style={{ color: statusColor, fontSize: "0.7rem", letterSpacing: "0.05em" }}>
                    {val}
                  </div>
                </div>
              ))}
            </div>

            {/* Terminal log */}
            <div style={{
              background: "#060609",
              border: "1px solid #111",
              borderRadius: "2px",
              padding: "0.8rem 1rem",
              minHeight: 100,
              maxHeight: 140,
              overflowY: "auto",
            }}>
              {logs.map((log) => (
                <LogLine key={log.id} text={log.text} color={log.color} />
              ))}
              {status === "verifying" && (
                <div style={{
                  color: "#555",
                  fontSize: "0.65rem",
                  animation: "blink 1s step-end infinite",
                  marginTop: "0.2rem",
                }}>
                  ▌
                </div>
              )}
            </div>

            {/* Error message */}
            {(status === "blocked" || status === "error") && errorMsg && (
              <div style={{
                marginTop: "1rem",
                padding: "0.8rem",
                background: "#ff444408",
                border: "1px solid #ff444433",
                borderRadius: "2px",
                color: "#ff4444",
                fontSize: "0.72rem",
                lineHeight: "1.6",
                textAlign: "center",
              }}>
                {errorMsg}
              </div>
            )}

            {/* Success redirect notice */}
            {status === "success" && (
              <div style={{
                marginTop: "1rem",
                padding: "0.8rem",
                background: "#00ff8808",
                border: "1px solid #00ff8833",
                borderRadius: "2px",
                color: "#00ff88",
                fontSize: "0.72rem",
                textAlign: "center",
                letterSpacing: "0.05em",
              }}>
                Redirecting to bot...
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            borderTop: "1px solid #111",
            padding: "0.6rem 1.2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span style={{ color: "#333", fontSize: "0.6rem", letterSpacing: "0.1em" }}>
              NXTZEN ENGINE
            </span>
            <span style={{ color: "#222", fontSize: "0.6rem" }}>
              SECURE CHANNEL
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
