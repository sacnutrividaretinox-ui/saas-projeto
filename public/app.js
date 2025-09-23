// Conectar e mostrar QR Code na tela
async function connectWhatsapp() {
  try {
    const res = await fetch("/api/qr"); // 🔥 corrigido: agora vai na rota certa
    const data = await res.json();

    if (data.qrCode) {
      document.getElementById("qrContainer").innerHTML = `
        <img src="${data.qrCode}" alt="QR Code" width="250"/>
        <p>Leia o QR Code no seu WhatsApp para conectar.</p>
      `;
    } else {
      document.getElementById("qrContainer").textContent =
        "Não foi possível gerar o QR Code.";
    }
  } catch (err) {
    document.getElementById("qrContainer").textContent =
      "Erro ao conectar ao servidor.";
  }
}

// Enviar mensagem
async function sendMessage() {
  const phone = document.getElementById("phone").value;
  const message = document.getElementById("message").value;

  const res = await fetch("/api/send-message", { // 🔥 corrigido: rota certa
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, message })
  });

  const data = await res.json();
  document.getElementById("serverResponse").textContent =
    JSON.stringify(data, null, 2);
}

// Atualizar prévia da mensagem
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
