// QR Code (Bearer Token)
app.get("/api/qr", async (req, res) => {
  try {
    console.log("📡 Requisição QR Code iniciada...");
    const url = `${ZAPI.baseUrl()}/qr-code/image`;
    console.log("URL chamada:", url);

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${ZAPI.token}` }, // ⚠️ só o Bearer
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
    console.error("❌ Erro na rota /api/qr:", err.response?.data || err.message);
    res.status(500).json({
      error: "Erro ao gerar QR Code",
      details: err.response?.data || err.message
    });
  }
});
