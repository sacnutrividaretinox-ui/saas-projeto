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
// Rota QR Code (debug nos dois endpoints)
// ============================
app.get("/qr", async (req, res) => {
  try {
    const resp1 = await axios
      .get(`${ZAPI.baseUrl()}/qr-code/image`, {
        headers: { "Client-Token": ZAPI.clientToken },
        timeout: 5000,
      })
      .catch((err) => ({ error: err.response?.data || err.message }));

    const resp2 = await axios
      .get(`${ZAPI.baseUrl()}/qr-code`, {
        headers: { "Client-Token": ZAPI.clientToken },
        timeout: 5000,
      })
      .catch((err) => ({ error: err.response?.data || err.message }));

    console.log("Resposta /qr-code/image:", resp1.data || resp1.error);
    console.log("Resposta /qr-code:", resp2.data || resp2.error);

    res.json({
      endpoint_image: resp1.data || resp1.error,
      endpoint_normal: resp2.data || resp2.error,
    });
  } catch (err) {
    res.status(500).json({
      error: "Falha geral na rota /qr",
      details: err.message,
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
      timeout: 5000,
    });

    const status = response.data?.status || "UNKNOWN";
    const connected = response.data?.connected || false;

    res.json({
      status,
      connected,
      message: connected
        ? "WhatsApp conectado"
        : status === "QRCODE"
        ? "Aguardando QR Code"
        : "Desconectado",
    });
  } catch (err) {
    console.error("[STATUS ERROR]", err.message, err.response?.data);
    res.status(500).json({
      status: "ERROR",
      message: "Erro ao conectar na API do WhatsApp",
      error: err.message,
      details: err.response?.data,
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
      headers: { "Client-Token": ZAPI.clientToken },
    });

    res.json(response.data);
  } catch (err) {
    console.error("Erro na rota /send-message:", err.response?.data || err.message);
    res.status(500).json({
      error: err.message,
      details: err.response?.data || null,
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
