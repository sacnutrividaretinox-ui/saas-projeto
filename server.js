app.get("/qr", async (req, res) => {
  try {
    const response = await axios.get(`${ZAPI.baseUrl()}/qr-code/image`, {
      headers: { "Client-Token": ZAPI.clientToken },
      timeout: 5000
    });

    console.log("Resposta Z-API /qr-code/image:", response.data);

    // Retorna tudo que a Z-API mandou
    res.json({ raw: response.data });
  } catch (err) {
    console.error("Erro na rota /qr:", err.response?.data || err.message);

    res.status(500).json({
      error: "Erro ao gerar QR Code",
      details: err.response?.data || err.message
    });
  }
});
