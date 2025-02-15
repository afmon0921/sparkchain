# sparkchain
Auto connect dan reconnect (24 jam) 

# SparkChain Auto Bot

Repository ini berisi ekstensi Chrome dan bot berbasis Node.js untuk auto-connect ke API SparkChain.

## 📌 Struktur Folder
```
sparkchain-bot/
│── chrome-extension/    # Folder untuk ekstensi Chrome
│   │── manifest.json
│   │── background.js
│   │── content.js
│   │── popup.html
│   │── popup.js
│── server/              # Script backend untuk auto-restart
│   │── bot.js
│   │── package.json
│   │── config.json
│── sparkchain-bot.service  # Systemd service untuk VPS
│── README.md
```

---

## **1️⃣ Ekstensi Chrome (`chrome-extension/`)**
### **manifest.json**
```json
{
  "manifest_version": 3,
  "name": "SparkChain Auto Bot",
  "version": "1.0",
  "description": "Bot otomatis SparkChain",
  "permissions": ["storage", "scripting", "alarms"],
  "host_permissions": ["https://api.sparkchain.ai/*"],
  "background": {
    "service_worker": "background.js"
  }
}
```

### **background.js**
```javascript
const API_URL = "https://api.sparkchain.ai/endpoint"; // Ganti sesuai API

function connectToAPI() {
    chrome.storage.local.get("bearerToken", (result) => {
        if (!result.bearerToken) {
            console.error("Token tidak ditemukan!");
            return;
        }

        fetch(API_URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${result.bearerToken}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log("✅ Koneksi Berhasil:", data);
        })
        .catch(error => {
            console.error("❌ Koneksi Gagal, mencoba ulang dalam 10 detik...", error);
            setTimeout(connectToAPI, 10000);
        });
    });
}

chrome.alarms.create("autoConnect", { periodInMinutes: 5 });
chrome.alarms.onAlarm.addListener(connectToAPI);
connectToAPI();
```

---

## **2️⃣ Script Backend untuk VPS (`server/bot.js`)**
```javascript
const fetch = require("node-fetch");
const fs = require("fs");

const config = JSON.parse(fs.readFileSync("config.json", "utf8"));
const API_URL = "https://api.sparkchain.ai/endpoint";

async function connectToAPI() {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${config.bearerToken}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        console.log("✅ API Response:", data);
    } catch (error) {
        console.error("❌ Error:", error);
        setTimeout(connectToAPI, 10000);
    }
}

connectToAPI();
setInterval(connectToAPI, 5 * 60 * 1000);
```

### **config.json**
```json
{
  "bearerToken": "your-bearer-token-here"
}
```

### **package.json**
```json
{
  "name": "sparkchain-bot",
  "version": "1.0.0",
  "main": "bot.js",
  "dependencies": {
    "node-fetch": "^3.0.0"
  }
}
```

---

## **3️⃣ Systemd Service untuk VPS (`sparkchain-bot.service`)**
```ini
[Unit]
Description=SparkChain Bot Auto-Reconnect
After=network.target

[Service]
ExecStart=/usr/bin/node /root/sparkchain-bot/server/bot.js
WorkingDirectory=/root/sparkchain-bot/server
Restart=always
User=root
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

---

## **🚀 Cara Install di VPS Linux**
### **1️⃣ Clone Repository & Install Dependencies**
```bash
git clone https://github.com/username/sparkchain-bot.git
cd sparkchain-bot/server
npm install
```

### **2️⃣ Setup Systemd Service**
```bash
sudo cp sparkchain-bot.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable sparkchain-bot
sudo systemctl start sparkchain-bot
```

---
🔥 **Sekarang bot berjalan 24/7 di VPS!** 🚀
