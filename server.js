// ============================
// 📦 Dependências
// ============================
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ============================
// 🔑 Credenciais Z-API (Railway → Variables)
// ============================
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID || "SEU_INSTANCE_ID",
  token: process.env.ZAPI_TOKEN || "SEU_TOKEN",
  baseUrl() {
    return `https://api.z-api.io/instances/${this.instanceId}/token/${this.token}`;
  },
  headers() {
    return {
      Authorization: `Bearer ${this.token}`, // ✅ Corrigido: autenticação correta
    };
  },
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

// Status
app.get("/api/status", (req, res) => {
  res.json({ status: "ok", message: "Micro SaaS rodando 🚀" });
});

// QR Code
app.get("/api/qr", async (req, res) => {
  try {
    console.log("📡 Requisição QR Code iniciada...");
    const url = `${ZAPI.baseUrl()}/qr-code/image`;

    const response = await axios.get(url, {
      headers: ZAPI.headers(),
      timeout: 10000,
    });

    if (response.data?.value) {
      res.json({ qrCode: response.data.value });
    } else {
      res.status(500).json({
        error: "QR Code não retornado pela Z-API",
        raw: response.data,
      });
    }
  } catch (err) {
    console.error("❌ Erro na rota /api/qr:", err.response?.data || err.message);
    res.status(500).json({
      error: "Erro ao gerar QR Code",
      details: err.response?.data || err.message,
    });
  }
});

// Enviar mensagem
app.post("/api/send-message", async (req, res) => {
  try {
    const { phone, message } = req.body;

    const url = `${ZAPI.baseUrl()}/send-text`;

    const response = await axios.post(
      url,
      { phone, message },
      { headers: ZAPI.headers() }
    );

    res.json(response.data);
  } catch (err) {
    console.error(
      "❌ Erro na rota /api/send-message:",
      err.response?.data || err.message
    );
    res.status(500).json({
      error: err.message,
      details: err.response?.data || null,
    });
  }
});

// ============================
// 🚀 Inicializar Servidor
// ============================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("=================================");
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📌 Instance ID: ${ZAPI.instanceId}`);
  console.log(`📌 Token: ${ZAPI.token}`);
  console.log("=================================");
});
