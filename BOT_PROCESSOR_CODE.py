########################################################################
# NxtZen IP Verification Bot - BOT_PROCESSOR_CODE.py
# ─────────────────────────────────────────────────────────────────────
#
#  2 Processors banao TBC bot me:
#
#  Processor 1:  ip_verify_handler   → PEHLA block paste karo
#  Processor 2:  check_ip_status     → DOOSRA block paste karo
#
########################################################################


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROCESSOR 1: ip_verify_handler
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import requests

vercel_url = Bot.getData("vercel_url")         # e.g. "https://ip-verify-xyz.vercel.app"
bot_username = Bot.getData("bot_username")      # e.g. "MyBotUsername"
user_id = str(user["telegramid"])

payload = {
    "user_id": user_id,
    "bot_username": bot_username
}

resp = requests.post(f"{vercel_url}/api/create-session", json=payload, timeout=10)
data = resp.json()

if data.get("success"):
    verify_url = data["url"]
    Bot.sendMessage(
        "🔐 *IP Verification Required*\n\n"
        "Your IP address needs to be verified before proceeding.\n\n"
        "Tap the button below to verify:",
        keyboard=[[{"text": "🌐 Verify My IP", "url": verify_url}]]
    )
else:
    Bot.sendMessage("❌ Could not generate verification link. Try again.")


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# PROCESSOR 2: check_ip_status
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import requests

vercel_url = Bot.getData("vercel_url")
bot_username = Bot.getData("bot_username")
user_id = str(user["telegramid"])

resp = requests.get(
    f"{vercel_url}/api/check-session",
    params={"user_id": user_id, "bot_username": bot_username},
    timeout=10
)
data = resp.json()
status = data.get("status", "unknown")

if status == "verified":
    ip = data.get("ip_address", "N/A")
    Bot.sendMessage(f"✅ IP Verified!\n\n🌐 IP: `{ip}`\n\nAccess granted.", parseMode="Markdown")
elif status == "pending":
    Bot.sendMessage("⏳ Verification pending. Please open the link and verify your IP.")
elif status == "failed":
    Bot.sendMessage("🚫 Verification failed. IP conflict detected.")
elif status == "expired":
    Bot.sendMessage("⏰ Session expired. Run /ip_verify_handler to get a new link.")
else:
    Bot.sendMessage(f"❓ Status: {status}")
