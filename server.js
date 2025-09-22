const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// 🔑 Credenciais fixas da Z-API
const ZAPI = {
  instanceId: "36EDD0DDEED00C0FD52197AEA2D17DA62",
  token: "0BF08CF5075ECC6C5937E55C",
  clientToken: "9E09CAB81F22425F5954C6C2",
  baseUrl() {
    return `https://api.z-api.io/instances/${this.instanceId}/token/${this.token}`;
  }
};

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
    console.error("Erro na rota /qr:", err.response?.data || err.message);
    res.status(500).json({
      error: "Erro ao gerar QR Code",
      details: err.response?.data || err.message
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
