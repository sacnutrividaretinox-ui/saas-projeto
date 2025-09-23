// QR CODE (MANTIDO IGUAL AO ORIGINAL)
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

    qrImage.src = `data:image/png;base64,${data.qrCode}`;
    qrImage.style.display = "block";
    qrStatus.innerText = "QR Code gerado com sucesso!";
    qrStatus.style.color = "limegreen";

  } catch (err) {
    qrStatus.innerText = `Erro inesperado: ${err.message}`;
    qrStatus.style.color = "red";
  }
});

// ---------- DISCONNECT ----------
document.getElementById("disconnectBtn")?.addEventListener("click", async () => {
  try {
    const res = await fetch("/api/disconnect", { method: "POST" });
    const data = await res.json();
    alert("Sessão desconectada! Agora gere um novo QR.");
    console.log(data);
  } catch (err) {
    alert("Erro ao desconectar: " + err.message);
  }
});

// ---------- RESTART ----------
document.getElementById("restartBtn")?.addEventListener("click", async () => {
  try {
    const res = await fetch("/api/restart", { method: "POST" });
    const data = await res.json();
    alert("Instância reiniciada! Agora gere um novo QR.");
    console.log(data);
  } catch (err) {
    alert("Erro ao reiniciar: " + err.message);
  }
});
