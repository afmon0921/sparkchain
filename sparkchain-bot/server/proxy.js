const { HttpsProxyAgent } = require("https-proxy-agent");

function getProxyAgent(proxyUrl) {
    if (!proxyUrl) return null;
    return new HttpsProxyAgent(proxyUrl);
}

module.exports = { getProxyAgent };