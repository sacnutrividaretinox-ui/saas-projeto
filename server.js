const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// Servir o frontend da pasta public
app.use(express.static(path.join(__dirname, "public")));

// 🔑 Configuração Z-API (coloque no Railway → Variables para não expor)
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID || "36EDD0D0EED00C0FD52197AEA2D17DA62",
  token: process.env.ZAPI_TOKEN || "0BF08CF5075ECC6C5937E55",
  clientToken: process.env.ZAPI_CLIENT_TOKEN || "Fe7345c73a1484ebaf66f02ff5220d25"
};

// 📌 Rota para gerar QR Code
app.get("/qr", async (req, res) => {
  try {
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/qr-code`;

    const response = await axios.get(url, {
      headers: { "client-token": ZAPI.clientToken }
    });

    // A Z-API já retorna o QR Code em base64
    res.json({ qrCode: response.data.qrCodeBase64 });
  } catch (err) {
    console.error("Erro ao gerar QR:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao gerar QR Code" });
  }
});

// 📌 Rota para enviar mensagem
app.post("/send-message", async (req, res) => {
  const { phone, message } = req.body;

  try {
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/send-text`;

    const response = await axios.post(
      url,
      { phone, message },
      { headers: { "client-token": ZAPI.clientToken } }
    );

    res.json({ status: "Mensagem enviada", data: response.data });
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao enviar mensagem" });
  }
});

// 📌 Porta dinâmica para Railway
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server rodando na porta ${PORT}`));
