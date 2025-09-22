const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 Credenciais da Z-API (pegas das variáveis de ambiente do Railway)
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID,
  token: process.env.ZAPI_TOKEN,
  clientToken: process.env.ZAPI_CLIENT_TOKEN,
  baseUrl() {
    return `https://api.z-api.io/instances/${this.instanceId}/token/${this.token}`;
  },
  headers() {
    return { "Client-Token": this.clientToken };
  }
};

// ============================
// Rota inicial
// ============================
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Micro SaaS rodando 🚀" });
});

// ============================
// Rota QR Code
// ============================
app.get("/qr", async (req, res) => {
  try {
    const response = await axios.get(`${ZAPI.baseUrl()}/qr-code/image`, {
      headers: ZAPI.headers(),
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
    console.error("Erro na rota /qr:", err.response?.data || err.message);
    res.status(500).json({
      error: "Erro ao gerar QR Code",
      details: err.response?.data || err.message
    });
  }
});

// ============================
// Rota Status
// ============================
app.get("/status", async (req, res) => {
  try {
    const response = await axios.get(ZAPI.baseUrl(), {
      headers: ZAPI.headers(),
      timeout: 5000
    });

    const status = response.data?.status || "UNKNOWN";
    const connected = response.data?.connected || false;

    res.json({
      status,
      connected,
      message:
        connected
          ? "WhatsApp conectado"
          : status === "QRCODE"
          ? "Aguardando QR Code"
          : "Desconectado"
    });
  } catch (err) {
    console.error("[STATUS ERROR]", err.message, err.response?.data);
    res.status(500).json({
      status: "ERROR",
      message: "Erro ao conectar na API do WhatsApp",
      error: err.message,
      details: err.response?.data
    });
  }
});

// ============================
// Rota enviar mensagem
// ============================
app.post("/send-message", async (req, res) => {
  try {
    const { phone, message, title, footer, buttonActions } = req.body;

    let url = `${ZAPI.baseUrl()}/send-text`;
    let payload = { phone, message };

    if (buttonActions && buttonActions.length > 0) {
      url = `${ZAPI.baseUrl()}/send-button-actions`;
      payload = { phone, message, title, footer, buttonActions };
    }

    const response = await axios.post(url, payload, {
      headers: ZAPI.headers()
    });

    res.json(response.data);
  } catch (err) {
    console.error("Erro na rota /send-message:", err.response?.data || err.message);
    res.status(500).json({
      error: err.message,
      details: err.response?.data || null
    });
  }
});

// ============================
// Inicializar servidor
// ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Micro SaaS rodando na porta ${PORT}`);
});
