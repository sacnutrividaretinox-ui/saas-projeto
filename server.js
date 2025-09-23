const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ============================
// 🔑 Credenciais Z-API
// ============================
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID || "36e0d0006e100c879f52f397a6a2d17d662",
  token: process.env.ZAPI_TOKEN || "3e90ca81f224815f259546d2c2",
  clientToken: process.env.ZAPI_CLIENT_TOKEN || "fe7345fc73d1484ba46f6b2ff122b025",
  baseUrl() {
    return `https://api.z-api.io/instances/${this.instanceId}/token/${this.token}`;
  }
};

// ============================
// 🚀 Servir Front-End
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
    console.log("📡 Requisição QR Code iniciada...");
    console.log("URL chamada:", `${ZAPI.baseUrl()}/qr-code`);

    const response = await axios.get(`${ZAPI.baseUrl()}/qr-code`, {
      headers: { "Client-Token": ZAPI.clientToken },
      timeout: 10000
    });

    if (response.data) {
      res.json({ qrCode: response.data });
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
  console.log(`🔑 Instance ID: ${ZAPI.instanceId}`);
  console.log(`🔑 Token: ${ZAPI.token}`);
  console.log(`🔑 Client Token: ${ZAPI.clientToken}`);
});