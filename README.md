# 🔐 NxtZen IP Verification Portal

Multi-bot **IP address** verification system.  
Ek Vercel deployment → multiple bots ke saath kaam karta hai.

---

## 📁 Project Structure

```
ip-verify/
├── app/
│   ├── layout.js
│   ├── page.js                        # Direct access block
│   ├── verify/[token]/
│   │   ├── page.js                    # Server: session fetch
│   │   └── VerifyClient.jsx           # Client: IP verify UI
│   └── api/
│       ├── create-session/route.js    # Bot → unique link
│       ├── verify/route.js            # Page → IP verify
│       └── check-session/route.js    # Bot → status check
├── lib/
│   └── mongodb.js
├── BOT_PROCESSOR_CODE.py
├── .env.example
└── vercel.json
```

---

## 🚀 Vercel Deploy

### 1. GitHub pe push karo (Termux):

```bash
cd ip-verify
git init
git add .
git commit -m "NxtZen IP Verify"
git remote add origin https://github.com/YOUR/ip-verify.git
git push -u origin master
```

### 2. Vercel pe import karo

- vercel.com → New Project → Import repo
- Framework: **Next.js** (auto detect)

### 3. Env variable daalo:

```
MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/ip_verify
```

---

## 🤖 TBC Bot Setup

```
Bot.saveData("vercel_url", "https://ip-verify-xyz.vercel.app")
Bot.saveData("bot_username", "YourBotUsername")
```

**Processor 1:** `ip_verify_handler` → BOT_PROCESSOR_CODE.py ka PEHLA block

**Processor 2:** `check_ip_status` → BOT_PROCESSOR_CODE.py ka DOOSRA block

---

## 🔄 Flow

```
Bot → POST /api/create-session {user_id, bot_username}
    ← {token, url}

User opens WebApp → IP detect hota hai
    → POST /api/verify {token, ip_address}
    ← success / ip_conflict

Bot → GET /api/check-session?user_id=X&bot_username=Y
    ← {status, ip_address}
```

---

## 🗄️ MongoDB Collections

### `sessions`
```json
{
  "token": "unique_hex",
  "user_id": "123456789",
  "bot_username": "MyBot",
  "status": "pending|verified|failed|expired",
  "ip_address": "1.2.3.4",
  "created_at": "ISODate",
  "expires_at": "ISODate (+10 min)",
  "verified_at": "ISODate"
}
```

### `ip_records`
```json
{
  "ip_address": "1.2.3.4",
  "user_id": "123456789",
  "bot_username": "MyBot",
  "first_seen": "ISODate",
  "last_seen": "ISODate"
}
```

---

## 🔐 IP Conflict Rules

| Situation | Result |
|---|---|
| New IP, new user | ✅ Verified |
| Same IP, same user | ✅ Already verified |
| Same IP, different user | 🚫 BLOCKED |

---

*Powered by NxtZen Engine*
