// ============================
// 📌 Dependências
// ============================
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ============================
// 🔑 Credenciais da Z-API (Railway → Variables)
// ============================
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID || "SEU_INSTANCE_ID",
  token: process.env.ZAPI_TOKEN || "SEU_TOKEN",
  clientToken: process.env.ZAPI_CLIENT_TOKEN || "SEU_CLIENT_TOKEN",
  baseUrl() {
    return `https://api.z-api.io/instances/${this.instanceId}/token/${this.token}`;
  }
};

// ============================
// 🚀 Servir Front-End (pasta public)
// ============================
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ============================
// ✅ Rotas da API
// ============================

// Status
app.get("/api/status", (req, res) => {
  res.json({ status: "ok", message: "Micro SaaS rodando 🚀" });
});

// QR Code
app.get("/api/qr", async (req, res) => {
  try {
    const response = await axios.get(`${ZAPI.baseUrl()}/qr-code/image`, {
      headers: { "Client-Token": ZAPI.clientToken },
      timeout: 10000
    });

    if (response.data?.value) {
      res.json({ qrCode: response.data.value });
    } else {
      res.status(500).json({
        error: "QR Code não retornado pela Z-API",
        raw: response.data
      });
    }
  } catch (err) {
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
    res.status(500).json({
      error: err.message,
      details: err.response?.data || null
    });
  }
});

// Desconectar sessão
app.post("/api/disconnect", async (req, res) => {
  try {
    const response = await axios.post(
      `${ZAPI.baseUrl()}/disconnect`,
      {},
      { headers: { "Client-Token": ZAPI.clientToken } }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Erro ao desconectar", details: err.response?.data || err.message });
  }
});

// Reiniciar instância
app.post("/api/restart", async (req, res) => {
  try {
    const response = await axios.post(
      `${ZAPI.baseUrl()}/restart`,
      {},
      { headers: { "Client-Token": ZAPI.clientToken } }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Erro ao reiniciar instância", details: err.response?.data || err.message });
  }
});

// ============================
// 🚀 Inicializar servidor
// ============================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
