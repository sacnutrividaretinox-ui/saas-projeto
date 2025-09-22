// ============================
// Rota QR Code (debug nos dois endpoints)
// ============================
app.get("/qr", async (req, res) => {
  try {
    const resp1 = await axios.get(`${ZAPI.baseUrl()}/qr-code/image`, {
      headers: { "Client-Token": ZAPI.clientToken },
      timeout: 5000
    }).catch(err => ({ error: err.response?.data || err.message }));

    const resp2 = await axios.get(`${ZAPI.baseUrl()}/qr-code`, {
      headers: { "Client-Token": ZAPI.clientToken },
      timeout: 5000
    }).catch(err => ({ error: err.response?.data || err.message }));

    console.log("Resposta /qr-code/image:", resp1.data || resp1.error);
    console.log("Resposta /qr-code:", resp2.data || resp2.error);

    res.json({
      endpoint_image: resp1.data || resp1.error,
      endpoint_normal: resp2.data || resp2.error
    });
  } catch (err) {
    res.status(500).json({
      error: "Falha geral na rota /qr",
      details: err.message
    });
  }
});
