const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ============================
// 🔑 Credenciais da Z-API (via Railway → Variables)
// ============================
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID || "SEU_INSTANCE_ID",
  token: process.env.ZAPI_TOKEN || "SEU_TOKEN",
  clientToken: process.env.ZAPI_CLIENT_TOKEN || "SEU_CLIENT_TOKEN",
  baseUrl() {
    return `https://api.z-api.io/instances/${this.instanceId}/token/${this.token}`;
  }
};

// Log inicial para conferir se variáveis estão carregadas
console.log("🔑 Variáveis carregadas:");
console.log("ZAPI_INSTANCE_ID:", ZAPI.instanceId);
console.log("ZAPI_TOKEN:", ZAPI.token);
console.log("ZAPI_CLIENT_TOKEN:", ZAPI.clientToken);

// ============================
// 🚀 Servir Front-End (index.html, styles.css, app.js)
// ============================
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ============================
// ✅ Rotas da API
// ============================

// Status API
app.get("/api/status", (req, res) => {
  res.json({ status: "ok", message: "Micro SaaS rodando 🚀" });
});

// QR Code
app.get("/api/qr", async (req, res) => {
  try {
    console.log("➡️ Requisição QR Code iniciada...");
    console.log("➡️ URL chamada:", `${ZAPI.baseUrl()}/qr-code/image`);

    const response = await axios.get(`${ZAPI.baseUrl()}/qr-code/image`, {
      headers: { "Client-Token": ZAPI.clientToken },
      timeout: 10000
    });

    console.log("✅ Resposta Z-API (QR):", response.data);

    if (response.data?.value) {
      res.json({ qrCode: response.data.value });
    } else {
      res.status(500).json({
        error: "QR Code não retornado pela Z-API",
        raw: response.data
      });
    }
  } catch (err) {
    console.error("❌ Erro na rota /api/qr:", err.response?.data || err.message);
    res.status(500).json({
      error: "Erro ao gerar QR Code",
      details: err.response?.data || err.message
    });
  }
});

// Enviar mensagem
app.post("/api/send-message", async (req, res) => {
  try {
    const { phone, message } = req.body;

    console.log("➡️ Enviando mensagem...");
    console.log("➡️ URL chamada:", `${ZAPI.baseUrl()}/send-text`);
    console.log("➡️ Payload:", { phone, message });

    const response = await axios.post(
      `${ZAPI.baseUrl()}/send-text`,
      { phone, message },
      { headers: { "Client-Token": ZAPI.clientToken } }
    );

    console.log("✅ Resposta Z-API (Send):", response.data);
    res.json(response.data);
  } catch (err) {
    console.error("❌ Erro na rota /api/send-message:", err.response?.data || err.message);
    res.status(500).json({
      error: err.message,
      details: err.response?.data || null
    });
  }
});

// ============================
// 🚀 Inicializar servidor
// ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
