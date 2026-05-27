"use client";

import { useEffect, useState, useRef } from "react";

function getStateColor(state) {
  if (state === "verified") return { main: "#6366f1", grad: "#8b5cf6", light: "#eef2ff", border: "#c7d2fe", text: "#4338ca" };
  if (state === "conflict") return { main: "#e11d48", grad: "#be123c", light: "#fff1f2", border: "#fecdd3", text: "#9f1239" };
  if (state === "error")    return { main: "#d97706", grad: "#b45309", light: "#fffbeb", border: "#fde68a", text: "#92400e" };
  return                           { main: "#0ea5e9", grad: "#6366f1", light: "#f0f9ff", border: "#bae6fd", text: "#0369a1" };
}

function closeTelegramWebApp() {
  try { if (window.Telegram?.WebApp) { window.Telegram.WebApp.close(); return; } } catch {}
  try { window.close(); } catch {}
}

function SunIcon({ size = 13, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" stroke={color} strokeWidth="1.4" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        return <line key={i} x1={8 + 5 * Math.cos(r)} y1={8 + 5 * Math.sin(r)} x2={8 + 6.8 * Math.cos(r)} y2={8 + 6.8 * Math.sin(r)} stroke={color} strokeWidth="1.3" strokeLinecap="round" />;
      })}
    </svg>
  );
}

function MoonIcon({ size = 13, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M13 10.5A6 6 0 0 1 5.5 3a6 6 0 1 0 7.5 7.5z" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GlobeIcon({ size = 40, state }) {
  const c = getStateColor(state);
  const spinning = state === "scanning" || state === "idle";
  const done = ["verified", "conflict", "error"].includes(state);
  const s = size * 2.4;

  return (
    <div style={{ position: "relative", width: s, height: s, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg style={{ position: "absolute", inset: 0 }} width={s} height={s} viewBox="0 0 100 100">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c.main} /><stop offset="100%" stopColor={c.grad} />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill="none" stroke={c.border} strokeWidth="1.2" />
        {spinning && (
          <circle cx="50" cy="50" r="46" fill="none" stroke="url(#ringGrad)" strokeWidth="2"
            strokeDasharray="40 250" strokeLinecap="round"
            style={{ transformOrigin: "50px 50px", animation: "spin 1.8s linear infinite" }} />
        )}
        {done && (
          <circle cx="50" cy="50" r="46" fill="none" stroke="url(#ringGrad)" strokeWidth="1.8" opacity="0.6" />
        )}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
          const r = (deg * Math.PI) / 180; const major = i % 3 === 0;
          return <line key={i}
            x1={50 + (major ? 43 : 44.5) * Math.cos(r)} y1={50 + (major ? 43 : 44.5) * Math.sin(r)}
            x2={50 + 46 * Math.cos(r)} y2={50 + 46 * Math.sin(r)}
            stroke={c.main} strokeWidth={major ? "1.2" : "0.7"} opacity={major ? 0.6 : 0.2} />;
        })}
      </svg>

      {/* Center circle */}
      <div style={{
        width: size * 1.5, height: size * 1.5, borderRadius: "50%",
        background: done ? `linear-gradient(135deg, ${c.light}, #fff)` : "linear-gradient(135deg, #f8faff, #fff)",
        border: `2px solid ${c.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 4px 20px ${c.main}20, 0 0 0 5px ${c.light}`,
        transition: "all 0.5s ease",
      }}>
        {/* Globe SVG icon */}
        <svg width={size * 0.75} height={size * 0.75} viewBox="0 0 36 36" fill="none">
          <defs>
            <linearGradient id="globeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={c.main} /><stop offset="100%" stopColor={c.grad} />
            </linearGradient>
          </defs>
          {/* Globe circle */}
          <circle cx="18" cy="18" r="15" fill={`${c.main}12`} stroke="url(#globeGrad)" strokeWidth="1.8" />
          {/* Latitude lines */}
          <ellipse cx="18" cy="18" rx="15" ry="6" fill="none" stroke="url(#globeGrad)" strokeWidth="1.2" opacity="0.5" />
          {/* Vertical center line */}
          <line x1="18" y1="3" x2="18" y2="33" stroke="url(#globeGrad)" strokeWidth="1.2" opacity="0.5" />
          {/* Horizontal center line */}
          <line x1="3" y1="18" x2="33" y2="18" stroke="url(#globeGrad)" strokeWidth="1.2" opacity="0.5" />

          {/* State icons */}
          {state === "verified" && (
            <polyline points="11,18 16,23 25,12" fill="none" stroke="url(#globeGrad)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {state === "conflict" && <>
            <line x1="13" y1="13" x2="23" y2="23" stroke="url(#globeGrad)" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="23" y1="13" x2="13" y2="23" stroke="url(#globeGrad)" strokeWidth="2.2" strokeLinecap="round" />
          </>}
          {state === "error" && <>
            <line x1="18" y1="11" x2="18" y2="21" stroke="url(#globeGrad)" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="18" cy="25.5" r="1.5" fill={c.main} />
          </>}
          {(state === "scanning" || state === "idle") && (
            <circle cx="18" cy="18" r="4" fill="none" stroke="url(#globeGrad)" strokeWidth="1.8"
              style={{ animation: "pulse 1.8s ease infinite" }} />
          )}
        </svg>
      </div>
    </div>
  );
}

function Avatar({ name, color, grad, light, text, dark }) {
  const initials = name ? name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase() : "?";
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: dark ? `linear-gradient(135deg, ${color}30, ${grad}18)` : `linear-gradient(135deg, ${light}, ${color}18)`,
      border: `1.5px solid ${color}45`,
    }}>
      <span style={{ fontSize: 16, fontWeight: 800, color: dark ? color : text, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>{initials}</span>
    </div>
  );
}

function UserStrip({ name, userId, C, dark }) {
  if (!name && !userId) return null;
  const displayName = name || "User";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "11px 14px", marginBottom: 20,
      background: dark ? "rgba(255,255,255,0.04)" : "rgba(248,249,255,0.95)",
      border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : C.border}`,
      borderRadius: 12, animation: "fadeUp 0.4s ease both",
    }}>
      <Avatar name={displayName} color={C.main} grad={C.grad} light={C.light} text={C.text} dark={dark} />
      <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
        <span style={{
          color: dark ? "#f0f4ff" : "#0f1629", fontSize: 14, fontWeight: 700, lineHeight: 1.2,
          fontFamily: "'DM Sans','Segoe UI',sans-serif",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{displayName}</span>
        {userId && (
          <span style={{ color: dark ? "rgba(255,255,255,0.32)" : "rgba(0,0,0,0.38)", fontSize: 10, letterSpacing: 1.5, fontFamily: "'IBM Plex Mono','Fira Code',monospace" }}>
            ID · {userId}
          </span>
        )}
      </div>
      <div style={{ marginLeft: "auto", flexShrink: 0 }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: `linear-gradient(135deg, ${C.main}, ${C.grad})`,
          boxShadow: `0 0 0 3px ${C.main}30`,
          animation: "pulse 2s ease infinite",
        }} />
      </div>
    </div>
  );
}

function ProgressBar({ pct, C, dark }) {
  return (
    <div>
      <div style={{ height: 4, borderRadius: 4, background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: `linear-gradient(90deg, ${C.main}, ${C.grad})`,
          borderRadius: 4, transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: `0 0 10px ${C.main}60`,
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ color: dark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.32)", fontSize: 9, letterSpacing: 1.5, fontFamily: "'IBM Plex Mono',monospace" }}>VERIFICATION PROGRESS</span>
        <span style={{ color: C.main, fontSize: 9, letterSpacing: 1, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700 }}>{pct}%</span>
      </div>
    </div>
  );
}

function LogPanel({ logs, C, dark }) {
  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : C.border}`, marginBottom: 14 }}>
      <div style={{
        padding: "7px 12px",
        background: dark ? `linear-gradient(90deg, ${C.main}10, transparent)` : `linear-gradient(90deg, ${C.light}, #fff)`,
        borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.05)" : C.border}`,
        display: "flex", alignItems: "center", gap: 7,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: `linear-gradient(135deg,${C.main},${C.grad})` }} />
        <span style={{ color: dark ? "rgba(255,255,255,0.4)" : C.text, fontSize: 8.5, letterSpacing: 2, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600 }}>ACTIVITY LOG</span>
      </div>
      <div style={{ padding: "10px 12px", minHeight: 70, background: dark ? "rgba(0,0,0,0.25)" : C.light + "88", fontFamily: "'IBM Plex Mono',monospace" }}>
        {logs.length === 0
          ? <span style={{ color: dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.25)", fontSize: 9 }}>Awaiting scan...</span>
          : logs.map((l, i) => (
            <div key={i} style={{
              color: i === logs.length - 1 ? (dark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.72)") : (dark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.28)"),
              fontSize: 9, lineHeight: 2.1, transition: "color 0.3s",
            }}>
              <span style={{ color: C.main, marginRight: 6, opacity: 0.7 }}>&rsaquo;</span>{l}
            </div>
          ))
        }
      </div>
    </div>
  );
}

function IPInfoPanel({ ipInfo, C, dark }) {
  if (!ipInfo || !ipInfo.query) return null;
  const rows = [
    { label: "IP",      value: ipInfo.query },
    { label: "ISP",     value: ipInfo.isp },
    { label: "Country", value: ipInfo.country },
    { label: "City",    value: ipInfo.city },
    ipInfo.proxy  && { label: "PROXY",   value: "Detected ⚠️" },
    ipInfo.hosting && { label: "HOSTING", value: "Detected ⚠️" },
  ].filter(Boolean);

  return (
    <div style={{
      borderRadius: 10, overflow: "hidden",
      border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : C.border}`,
      marginBottom: 14,
    }}>
      <div style={{
        padding: "7px 12px",
        background: dark ? `linear-gradient(90deg, ${C.main}10, transparent)` : `linear-gradient(90deg, ${C.light}, #fff)`,
        borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.05)" : C.border}`,
        display: "flex", alignItems: "center", gap: 7,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: `linear-gradient(135deg,${C.main},${C.grad})` }} />
        <span style={{ color: dark ? "rgba(255,255,255,0.4)" : C.text, fontSize: 8.5, letterSpacing: 2, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600 }}>IP DETAILS</span>
      </div>
      <div style={{ padding: "10px 12px", background: dark ? "rgba(0,0,0,0.25)" : C.light + "88" }}>
        {rows.map((row, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "4px 0",
            borderBottom: i < rows.length - 1 ? `1px solid ${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"}` : "none",
          }}>
            <span style={{ color: dark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.38)", fontSize: 9, letterSpacing: 1.5, fontFamily: "'IBM Plex Mono',monospace" }}>{row.label}</span>
            <span style={{ color: dark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.72)", fontSize: 9, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 600 }}>{row.value || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProceedBtn({ C, label, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      width: "100%", padding: "15px 0",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
      background: `linear-gradient(135deg, ${C.main}, ${C.grad})`,
      border: "none", borderRadius: 12, color: "#fff",
      cursor: "pointer", outline: "none",
      fontSize: 14, letterSpacing: 1.5, fontWeight: 700,
      fontFamily: "'DM Sans','Segoe UI',sans-serif",
      transition: "all 0.22s ease",
      boxShadow: hov ? `0 12px 36px ${C.main}60, 0 4px 12px ${C.grad}40` : `0 6px 24px ${C.main}40`,
      transform: hov ? "translateY(-1px)" : "translateY(0)",
      animation: "fadeUp 0.4s ease both 0.1s",
      WebkitTapHighlightColor: "transparent",
      userSelect: "none",
    }}>
      {label}
      <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
        <path d="M2 6h8M6 2l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export default function VerifyClient({ token, session }) {
  const [state,       setState]      = useState("idle");
  const [pct,         setPct]        = useState(0);
  const [statusText,  setStatusText] = useState("Initializing");
  const [subText,     setSubText]    = useState("Preparing secure environment");
  const [logs,        setLogs]       = useState([]);
  const [dark,        setDark]       = useState(true);
  const [ipInfo,      setIpInfo]     = useState(null);
  const hasRun = useRef(false);

  const C    = getStateColor(state);
  const done = ["verified", "conflict", "error"].includes(state);

  const userName = session?.first_name || null;
  const userId   = session?.user_id    || null;

  const addLog = t => setLogs(p => [...p.slice(-4), t]);
  const wait   = ms => new Promise(r => setTimeout(r, ms));

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    try { window.Telegram?.WebApp?.ready(); } catch {}

    if (!session) {
      setState("error"); setStatusText("Invalid Session");
      setSubText("This link does not exist or has been removed.");
      return;
    }
    if (session.status === "expired" || (session.expires_at && new Date() > new Date(session.expires_at))) {
      setState("error"); setStatusText("Session Expired");
      setSubText("Request a new verification link from the bot.");
      return;
    }
    if (session.status === "verified") {
      setState("verified"); setStatusText("Already Verified");
      setSubText("This IP is already authenticated."); setPct(100);
      setTimeout(() => closeTelegramWebApp(), 2000);
      return;
    }
    runScan();
  }, []);

  async function runScan() {
    setState("scanning");
    setStatusText("Detecting IP"); setSubText("Capturing network address");
    addLog("Network interface probed"); setPct(15); await wait(350);
    addLog("IP address captured"); setPct(30); await wait(300);
    setStatusText("Fetching IP Info"); setSubText("Querying geolocation database");
    addLog("Querying ISP registry"); setPct(50); await wait(350);
    addLog("Geolocation resolved"); setPct(65); await wait(300);
    setStatusText("Checking Registry"); setSubText("Cross-referencing account database");
    addLog("Scanning for conflicts"); setPct(82); await wait(400);

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      setPct(100);

      if (data.ip_info) setIpInfo(data.ip_info);

      if (!res.ok) {
        if (data.code === "IP_CONFLICT") {
          setState("conflict");
          setStatusText("Access Denied");
          setSubText("This IP is bound to another account.");
          addLog("Conflict: IP already registered");
          if (data.ip_info) setIpInfo(data.ip_info);
          setTimeout(() => closeTelegramWebApp(), 2000);
        } else {
          setState("error");
          setStatusText("Verification Failed");
          setSubText(data.error || "An error occurred.");
        }
        return;
      }

      setState("verified");
      setStatusText("Access Granted");
      setSubText("IP verified — closing in 2s");
      addLog("Verification complete");
      setTimeout(() => closeTelegramWebApp(), 2000);
    } catch {
      setState("error");
      setStatusText("Network Error");
      setSubText("Connection to server failed.");
    }
  }

  const pageBg = dark
    ? `radial-gradient(ellipse 80% 60% at 15% 15%, ${C.main}12 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 85% 85%, ${C.grad}0e 0%, transparent 55%), #0b0e1a`
    : `radial-gradient(ellipse 80% 60% at 15% 15%, ${C.light} 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 85% 85%, ${C.border}80 0%, transparent 55%), #f0f4ff`;
  const cardBg   = dark ? "rgba(14,18,32,0.97)"   : "rgba(255,255,255,0.98)";
  const cardBdr  = dark ? "rgba(255,255,255,0.08)" : C.border;
  const cardShad = dark
    ? `0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px ${C.main}15, inset 0 1px 0 rgba(255,255,255,0.05)`
    : `0 12px 60px rgba(0,0,0,0.10), 0 0 0 1px ${C.border}, inset 0 1px 0 #fff`;
  const hdrBg    = dark ? `linear-gradient(90deg, ${C.main}0e, ${C.grad}08)` : `linear-gradient(90deg, ${C.light}, #fff)`;
  const hdrBdr   = dark ? "rgba(255,255,255,0.06)" : C.border;
  const ftrBg    = dark ? "rgba(0,0,0,0.3)"        : C.light + "aa";
  const labelClr = dark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.38)";
  const titleClr = dark ? "#eef2ff"                : "#0f1629";
  const subClr   = dark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)";
  const tglBg    = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const tglBdr   = dark ? "rgba(255,255,255,0.12)" : C.border;
  const tglClr   = dark ? "rgba(255,255,255,0.55)" : C.text;

  const badgeLabel = done
    ? (state === "verified" ? "VERIFIED" : state === "conflict" ? "BLOCKED" : "ERROR")
    : "SCANNING";

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; transition: background 0.35s; }
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes fadeUp   { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse    { 0%,100% { opacity: 0.55; } 50% { opacity: 1; } }
        @keyframes blink    { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes subtleIn { from { opacity: 0; } to { opacity: 1; } }
        button { -webkit-tap-highlight-color: transparent !important; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: pageBg, transition: "background 0.4s" }} />

      <div style={{
        position: "relative", zIndex: 2,
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif",
      }}>
        <div style={{
          width: "100%", maxWidth: 390,
          background: cardBg, border: `1px solid ${cardBdr}`,
          borderRadius: 20, overflow: "hidden",
          boxShadow: cardShad,
          animation: "fadeUp 0.45s cubic-bezier(0.4,0,0.2,1)",
          transition: "background 0.35s,border-color 0.35s,box-shadow 0.4s",
        }}>

          {/* HEADER */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: `1px solid ${hdrBdr}`,
            background: hdrBg,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9,
                background: `linear-gradient(135deg, ${C.main}25, ${C.grad}15)`,
                border: `1.5px solid ${C.main}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                  <defs>
                    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={C.main} /><stop offset="100%" stopColor={C.grad} />
                    </linearGradient>
                  </defs>
                  <circle cx="10" cy="10" r="8.5" stroke="url(#logoGrad)" strokeWidth="1.5" />
                  <ellipse cx="10" cy="10" rx="8.5" ry="3.5" stroke="url(#logoGrad)" strokeWidth="1.2" opacity="0.6" />
                  <line x1="10" y1="1.5" x2="10" y2="18.5" stroke="url(#logoGrad)" strokeWidth="1.2" opacity="0.6" />
                  <line x1="1.5" y1="10" x2="18.5" y2="10" stroke="url(#logoGrad)" strokeWidth="1.2" opacity="0.6" />
                </svg>
              </div>
              <span style={{ color: titleClr, fontSize: 13, fontWeight: 700, letterSpacing: 0.2 }}>
                NxtZen IP Verify
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                padding: "3px 9px", borderRadius: 6,
                background: `linear-gradient(135deg, ${C.main}18, ${C.grad}10)`,
                border: `1px solid ${C.main}40`,
                color: C.main, fontSize: 8.5, letterSpacing: 1.5, fontWeight: 700,
                fontFamily: "'IBM Plex Mono',monospace",
              }}>{badgeLabel}</span>

              <button onClick={() => setDark(d => !d)} style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 10px",
                background: tglBg, border: `1px solid ${tglBdr}`, borderRadius: 7,
                cursor: "pointer", outline: "none", color: tglClr,
                fontSize: 9, letterSpacing: 1.2, fontWeight: 600,
                fontFamily: "'DM Sans','Segoe UI',sans-serif",
                transition: "all 0.25s", backdropFilter: "blur(8px)",
              }}>
                {dark ? <SunIcon color={tglClr} /> : <MoonIcon color={tglClr} />}
                {dark ? "Light" : "Dark"}
              </button>
            </div>
          </div>

          {/* BODY */}
          <div style={{ padding: "24px 20px 20px" }}>
            <UserStrip name={userName} userId={userId} C={C} dark={dark} />

            <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
              <GlobeIcon size={40} state={state} />
            </div>

            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <h2 style={{
                color: titleClr, fontSize: 20, fontWeight: 800,
                letterSpacing: -0.4, marginBottom: 7, lineHeight: 1.1,
                fontFamily: "'DM Sans','Segoe UI',sans-serif",
              }}>
                {statusText}
                {!done && <span style={{ animation: "blink 1s step-start infinite", color: C.main }}>_</span>}
              </h2>
              <p style={{ color: subClr, fontSize: 12.5, lineHeight: 1.65 }}>{subText}</p>
            </div>

            <div style={{ marginBottom: 18 }}>
              <ProgressBar pct={pct} C={C} dark={dark} />
            </div>

            <LogPanel logs={logs} C={C} dark={dark} />

            {/* IP Info panel - verified ya conflict hone pe dikhao */}
            {(state === "verified" || state === "conflict") && ipInfo && (
              <IPInfoPanel ipInfo={ipInfo} C={C} dark={dark} />
            )}

            {/* Conflict banner */}
            {state === "conflict" && (
              <div style={{
                padding: "13px 14px", marginBottom: 14,
                background: dark ? "rgba(225,29,72,0.08)" : "#fff1f2",
                border: "1px solid rgba(225,29,72,0.22)", borderRadius: 10,
                animation: "subtleIn 0.3s ease",
              }}>
                <div style={{ color: "#e11d48", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, marginBottom: 6, fontFamily: "'IBM Plex Mono',monospace" }}>
                  IP CONFLICT
                </div>
                <p style={{ color: subClr, fontSize: 11, lineHeight: 1.7 }}>
                  This IP address is already linked to a different account. Each IP may only be associated with one account.
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 9, paddingTop: 8, borderTop: "1px solid rgba(225,29,72,0.12)" }}>
                  <span style={{ color: labelClr, fontSize: 9, letterSpacing: 1.5, fontFamily: "'IBM Plex Mono',monospace" }}>CODE</span>
                  <span style={{ color: "#e11d48", fontSize: 9, fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace" }}>IP_ALREADY_REGISTERED</span>
                </div>
              </div>
            )}

            {done && (
              <ProceedBtn C={C} label="Close" onClick={closeTelegramWebApp} />
            )}
          </div>

          {/* FOOTER */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "9px 18px",
            borderTop: `1px solid ${hdrBdr}`,
            background: ftrBg,
          }}>
            <span style={{ color: labelClr, fontSize: 8.5, letterSpacing: 0.5, fontFamily: "'IBM Plex Mono',monospace" }}>TLS 1.3 · SHA-256 · AES-256</span>
            <span style={{ color: labelClr, fontSize: 8.5, letterSpacing: 0.5, fontFamily: "'IBM Plex Mono',monospace" }}>NxtZen Engine</span>
          </div>
        </div>
      </div>
    </>
  );
}
