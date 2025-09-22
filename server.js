const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 Credenciais da Z-API (variáveis de ambiente)
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID || "SEM_INSTANCE",
  token: process.env.ZAPI_TOKEN || "SEM_TOKEN",
  clientToken: process.env.ZAPI_CLIENT_TOKEN || "SEM_CLIENT",
  baseUrl() {
    return `https://api.z-api.io/instances/${this.instanceId}/token/${this.token}`;
  }
};

// ============================
// Debug inicial
// ============================
console.log("🚀 Variáveis de ambiente carregadas:");
console.log("ZAPI_INSTANCE_ID:", ZAPI.instanceId ? ZAPI.instanceId.slice(0, 4) + "..." + ZAPI.instanceId.slice(-4) : "NÃO DEFINIDO");
console.log("ZAPI_TOKEN:", ZAPI.token ? ZAPI.token.slice(0, 4) + "..." + ZAPI.token.slice(-4) : "NÃO DEFINIDO");
console.log("ZAPI_CLIENT_TOKEN:", ZAPI.clientToken ? ZAPI.clientToken.slice(0, 4) + "..." + ZAPI.clientToken.slice(-4) : "NÃO DEFINIDO");

// ============================
// Rota de teste
// ============================
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Micro SaaS rodando 🚀" });
});

// ============================
// Rota QR Code
// ============================
app.get("/qr", async (req, res) => {
  try {
    const url = `${ZAPI.baseUrl()}/qr-code/image`;
    console.log("🔗 Chamando:", url);

    const response = await axios.get(url, {
      headers: { "Client-Token": ZAPI.clientToken },
      timeout: 10000
    });

    res.json(response.data);
  } catch (err) {
    console.error("❌ Erro ao gerar QR Code:", err.response?.data || err.message);
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

    res.json(response.data);
  } catch (err) {
    console.error("❌ Erro no /status:", err.response?.data || err.message);
    res.status(500).json({
      status: "ERROR",
      error: err.message,
      details: err.response?.data
    });
  }
});

// ============================
// Inicializar servidor
// ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
