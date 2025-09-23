document.getElementById("generateQrBtn")?.addEventListener("click", async () => {
  const qrImage = document.getElementById("qrImage");
  const qrStatus = document.getElementById("qrStatus");

  qrStatus.innerText = "Gerando QR Code...";
  qrStatus.style.color = "#00bcd4";
  qrImage.style.display = "none";
  qrImage.removeAttribute("src");

  try {
    const res = await fetch("/api/qr");
    const data = await res.json();

    if (data.error) {
      qrStatus.innerText = `Erro: ${data.error}`;
      qrStatus.style.color = "red";
      return;
    }

    if (data.qrCode) {
      // Decide se é URL ou base64 cru
      if (data.qrCode.startsWith("http")) {
        qrImage.src = data.qrCode;
      } else {
        qrImage.src = `data:image/png;base64,${data.qrCode}`;
      }

      qrImage.style.display = "block";
      qrStatus.innerText = "QR Code carregado!";
      qrStatus.style.color = "limegreen";

      console.log("✅ QR aplicado no src:", qrImage.src.substring(0, 100) + "...");
    } else {
      qrStatus.innerText = "QR Code não retornado pela API.";
      qrStatus.style.color = "red";
    }
  } catch (err) {
    qrStatus.innerText = `Erro inesperado: ${err.message}`;
    qrStatus.style.color = "red";
  }
});
