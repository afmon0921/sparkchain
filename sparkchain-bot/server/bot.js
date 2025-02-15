const fetch = require("node-fetch");
const fs = require("fs");
const readline = require("readline");
const { getProxyAgent } = require("./proxy");

const config = JSON.parse(fs.readFileSync("config.json", "utf8"));
const API_URL = "https://api.sparkchain.ai/endpoint";

function loadProxies() {
    try {
        const proxies = fs.readFileSync("proxy.txt", "utf8").split("\n").map(line => line.trim()).filter(line => line);
        return proxies;
    } catch (error) {
        console.error("❌ Tidak dapat membaca file proxy.txt");
        return [];
    }
}

async function connectToAPI(proxy) {
    try {
        const options = {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${config.bearerToken}`,
                "Content-Type": "application/json"
            },
            agent: getProxyAgent(proxy)
        };

        const response = await fetch(API_URL, options);
        const data = await response.json();
        console.log("✅ API Response:", data);
    } catch (error) {
        console.error("❌ Error:", error);
        setTimeout(() => connectToAPI(proxy), 10000);
    }
}

async function sendHeartbeat(proxy) {
    try {
        const options = {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${config.bearerToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: "alive" }),
            agent: getProxyAgent(proxy)
        };

        await fetch(API_URL + "/heartbeat", options);
        console.log("💓 Heartbeat Sent");
    } catch (error) {
        console.error("❌ Heartbeat Error:", error);
    }
}

async function startBot() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question("Gunakan proxy? (y/n): ", (answer) => {
        const useProxy = answer.toLowerCase() === "y";
        const proxies = useProxy ? loadProxies() : [];
        const proxy = proxies.length > 0 ? proxies[0] : null;

        connectToAPI(proxy);
        setInterval(() => connectToAPI(proxy), 5 * 60 * 1000);
        setInterval(() => sendHeartbeat(proxy), 60 * 1000);

        rl.close();
    });
}

startBot();