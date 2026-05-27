# ============================================
# TBC BOT CODE - IP VERIFY
# ============================================
# 3 commands banana hai TBC dashboard mein:
# 1. start
# 2. ip_verified
# 3. ip_conflict
# ============================================


# ── Command: start ──────────────────────────

user_id    = str(message.from_user.id)
first_name = message.from_user.first_name or "User"

tg_res      = HTTP.get(f"https://api.telegram.org/bot{bot_token}/getMe")
BOT_USERNAME = tg_res.json()["result"]["username"]
BOT_ID       = str(tg_res.json()["result"]["id"])

webhook_success  = libs.Webhook.getUrlFor("ip_verified",  user_id=message.from_user.id)
webhook_conflict = libs.Webhook.getUrlFor("ip_conflict",  user_id=message.from_user.id)

res = HTTP.post(
    "https://YOUR_VERCEL_URL/api/create-session",
    json={
        "user_id":              user_id,
        "bot_username":         BOT_USERNAME,
        "bot_id":               BOT_ID,
        "first_name":           first_name,
        "webhook_url":          webhook_success,
        "webhook_conflict_url": webhook_conflict,
    }
)
data = res.json()

if data.get("success"):
    verify_url = data["url"]
    bot.sendMessage(
        "👋 *Welcome!*\n\n"
        "🌐 To use this bot, you need to verify your IP first.\n\n"
        "👇 Click the button below:",
        parse_mode="Markdown",
        reply_markup={
            "inline_keyboard": [[
                {"text": "🔍 Verify My IP", "web_app": {"url": verify_url}}
            ]]
        }
    )
else:
    bot.sendMessage("❌ Something went wrong. Please try /start again.")


# ── Command: ip_verified ────────────────────

bot.sendMessage(
    "✅ *IP VERIFIED!*\n"
    "━━━━━━━━━━━━━━━━━━━━\n\n"
    "🌐 Your IP has been successfully verified!\n"
    "You can now use the bot. 🚀\n\n"
    "━━━━━━━━━━━━━━━━━━━━",
    parse_mode="Markdown"
)


# ── Command: ip_conflict ────────────────────

bot.sendMessage(
    "⚠️ *IP CONFLICT DETECTED!*\n"
    "━━━━━━━━━━━━━━━━━━━━\n\n"
    "🚫 This IP address is already registered with a different account.\n"
    "Multi-account usage from the same network is not allowed.\n\n"
    "━━━━━━━━━━━━━━━━━━━━",
    parse_mode="Markdown"
)
