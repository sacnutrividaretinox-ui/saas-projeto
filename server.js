const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ============================
// 🔑 Credenciais Z-API (via Railway → Variables)
// ============================
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID || "SEU_INSTANCE_ID",
  token: process.env.ZAPI_TOKEN || "SEU_TOKEN",
  clientToken: process.env.ZAPI_CLIENT_TOKEN || "SEU_CLIENT_TOKEN",
  baseUrl() {
    return `https://api.z-api.io/instances/${this.instanceId}/token/${this.token}`;
  }
};

// 🔍 LOG inicial para debug
console.log("===================================");
console.log("🔑 Credenciais carregadas:");
console.log("Instance ID:", ZAPI.instanceId);
console.log("Token:", ZAPI.token);
console.log("Client Token:", ZAPI.clientToken);
console.log("===================================");

// ============================
// 🚀 Servir Front-End
// ============================
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ============================
// ✅ Rotas API
// ============================

// Status
app.get("/api/status", (req, res) => {
  res.json({ status: "ok", message: "Micro SaaS rodando 🚀" });
});

// QR Code
app.get("/api/qr", async (req, res) => {
  console.log("📡 Requisição /api/qr iniciada...");
  console.log("URL chamada:", `${ZAPI.baseUrl()}/qr-code/image`);

  try {
    const response = await axios.get(`${ZAPI.baseUrl()}/qr-code/image`, {
      headers: { "Client-Token": ZAPI.clientToken },
      timeout: 10000
    });

    if (response.data?.value) {
      return res.json({ qrCode: response.data.value });
    }

    res.status(500).json({
      error: "QR Code não retornado",
      raw: response.data
    });
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
  console.log("📡 Requisição /api/send-message");
  console.log("Payload:", req.body);

  try {
    const { phone, message } = req.body;
    const response = await axios.post(
      `${ZAPI.baseUrl()}/send-text`,
      { phone, message },
      { headers: { "Client-Token": ZAPI.clientToken } }
    );

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
