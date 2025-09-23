// Conectar e mostrar QR Code
async function connectWhatsapp() {
  try {
    console.log("🔄 Tentando gerar QR Code...");
    const res = await fetch("/api/qr");
    const data = await res.json();

    if (data.qrCode) {
      document.getElementById("qrContainer").innerHTML = `
        <img src="${data.qrCode}" alt="QR Code" width="250"/>
        <p>Leia o QR Code no seu WhatsApp para conectar.</p>
      `;
    } else {
      document.getElementById("qrContainer").textContent =
        "Não foi possível gerar o QR Code.";
      console.error("Resposta da API:", data);
    }
  } catch (err) {
    document.getElementById("qrContainer").textContent =
      "Erro ao conectar ao servidor.";
    console.error("Erro ao conectar:", err);
  }
}

// Enviar mensagem
async function sendMessage() {
  const phone = document.getElementById("phone").value;
  const message = document.getElementById("message").value;

  console.log("📤 Enviando mensagem:", { phone, message });

  const res = await fetch("/api/send-message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, message })
  });

  const data = await res.json();
  document.getElementById("serverResponse").textContent =
    JSON.stringify(data, null, 2);
}

// Prévia da mensagem
document.getElementById("message").addEventListener("input", (e) => {
  document.getElementById("previewText").textContent = e.target.value;
});

// Upload CSV
document.getElementById("fileInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    document.getElementById("csvOutput").textContent = text;
  };
  reader.readAsText(file);
});
