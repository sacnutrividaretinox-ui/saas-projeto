// Gerar QR Code
document.getElementById("generateQrBtn")?.addEventListener("click", async () => {
  const qrImage = document.getElementById("qrImage");
  const qrStatus = document.getElementById("qrStatus");

  qrStatus.innerText = "Gerando QR Code...";
  qrStatus.style.color = "#00bcd4";
  qrImage.style.display = "none";

  try {
    const res = await fetch("/api/qr");
    const data = await res.json();

    if (data.error) {
      qrStatus.innerText = `Erro: ${data.error}`;
      qrStatus.style.color = "red";
      return;
    }

    if (data.qrCode) {
      // ✅ Monta o base64 como PNG
      qrImage.src = `data:image/png;base64,${data.qrCode}`;
      qrImage.style.display = "block";
      qrStatus.innerText = "QR Code gerado com sucesso!";
      qrStatus.style.color = "limegreen";
    } else {
      qrStatus.innerText = "QR Code não retornado pela API.";
      qrStatus.style.color = "red";
    }
  } catch (err) {
    qrStatus.innerText = `Erro inesperado: ${err.message}`;
    qrStatus.style.color = "red";
  }
});
