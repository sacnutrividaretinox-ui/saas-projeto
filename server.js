const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// ============================
// Servir frontend da pasta public
// ============================
app.use(express.static(path.join(__dirname, "public")));

// ============================
// 🔑 Configuração da Z-API
// ============================
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID || "36EDD0D0EED00C0FD52197AEA2D17DA62",
  token: process.env.ZAPI_TOKEN || "0BF08CF5075ECC6C5937E55",
  clientToken: process.env.ZAPI_CLIENT_TOKEN || "Fe7345c73a1484ebaf66f02ff5220d25",
  baseUrl() {
    return `https://api.z-api.io/instances/${this.instanceId}/token/${this.token}`;
  }
};

// ============================
// Rota de teste
// ============================
app.get("/api", (req, res) => {
  res.json({ status: "ok", message: "API rodando!" });
});

// ============================
// Rota QR Code (com fallback)
// ============================
app.get("/qr", async (req, res) => {
  try {
    // Primeiro tenta o endpoint /qr-code/image
    let response = await axios.get(`${ZAPI.baseUrl()}/qr-code/image`, {
      headers: { "Client-Token": ZAPI.clientToken },
      timeout: 5000
    });

    console.log("Resposta Z-API /qr-code/image:", response.data);

    let qrCode =
      response.data?.value ||
      response.data?.qrCodeBase64 ||
      response.data?.qrCode ||
      null;

    // Se não achou, tenta o endpoint /qr-code
    if (!qrCode) {
      response = await axios.get(`${ZAPI.baseUrl()}/qr-code`, {
        headers: { "Client-Token": ZAPI.clientToken },
        timeout: 5000
      });

      console.log("Resposta Z-API /qr-code:", response.data);

      qrCode =
        response.data?.value ||
        response.data?.qrCodeBase64 ||
        response.data?.qrCode ||
        null;
    }

    if (qrCode) {
      res.json({ qrCode });
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
      headers: { "Client-Token": ZAPI.clientToken },
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
      headers: { "Client-Token": ZAPI.clientToken }
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
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Micro SaaS rodando na porta ${PORT}`);
});
