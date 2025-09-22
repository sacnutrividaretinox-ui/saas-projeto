// 📌 Corrigido para chamar backend do mesmo domínio (Railway ou local)
async function connectWhatsapp() {
  const res = await fetch("/qr");
  const data = await res.json();
  alert("QR Code gerado! Veja os logs.");
  console.log("QR:", data);
}

async function sendMessage() {
  const phone = document.getElementById("phone").value;
  const message = document.getElementById("message").value;

  const res = await fetch("/send-message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, message })
  });

  const data = await res.json();
  document.getElementById("serverResponse").textContent = JSON.stringify(data, null, 2);
}

document.getElementById("message").addEventListener("input", (e) => {
  document.getElementById("previewText").textContent = e.target.value;
});

document.getElementById("fileInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    document.getElementById("csvOutput").textContent = text;
  };
  reader.readAsText(file);
});
