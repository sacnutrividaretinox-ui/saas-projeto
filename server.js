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
// Use Variables no Railway (não deixe credenciais hardcoded)
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
// Rota QR Code
// ============================
app.get("/qr", async (req, res) => {
  try {
    const response = await axios.get(`${ZAPI.baseUrl()}/qr-code/image`, {
      headers: { "Client-Token": ZAPI.clientToken },
      timeout: 5000
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
// Rota Phone Code (gerar)
// ============================
app.get("/phone-code/:phone", async (req, res) => {
  let phone = req.params.phone.trim();

  if (phone.startsWith("+")) phone = phone.slice(1);
  if (!phone.match(/^\d+$/)) {
    return res.status(400).json({ error: "Número de telefone inválido" });
  }

  try {
    const response = await axios.get(
      `${ZAPI.baseUrl()}/phone-code/${phone}`,
      {
        headers: { "Client-Token": ZAPI.clientToken },
        timeout: 15000
      }
    );

    const code = response.data?.value || response.data?.code || null;

    if (!code) {
      return res.status(500).json({
        error: "Código não retornado pela Z-API",
        raw: response.data
      });
    }

    res.json({ code });
  } catch (err) {
    console.error("Erro ao gerar Phone Code:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: "Erro ao gerar código",
      details: err.response?.data || err.message
    });
  }
});

// ============================
// Rota Phone Code (validar/conectar)
// ============================
app.post("/validate-phone-code", async (req, res) => {
  const { code } = req.body;

  if (!code) return res.status(400).json({ error: "Código é obrigatório" });

  try {
    const response = await axios.post(
      `${ZAPI.baseUrl()}/connect-phone`,
      { code },
      { headers: { "Client-Token": ZAPI.clientToken } }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Erro na rota /validate-phone-code:", err.response?.data || err.message);
    res.status(500).json({
      error: err.message,
      details: err.response?.data || null
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
