// ... (todo o código anterior já entregue continua igual)

// ---------- QR CODE ----------
generateQrBtn?.addEventListener('click', async ()=>{
  qrSpin.hidden = false;
  qrImage.hidden = true;
  qrStatus.textContent = 'Gerando QR Code...';
  try{
    await sleep(1500);
    const res = await fetch('/api/qr');
    const data = await res.json();
    if(data?.qrCode){
      qrImage.src = `data:image/png;base64,${data.qrCode}`;
      qrImage.hidden = false;
      qrStatus.textContent = 'QR Code pronto! Escaneie no WhatsApp.';
      log('QR code gerado com sucesso', 'ok');
    }else{
      throw new Error(data?.error || 'QR não retornado');
    }
  }catch(err){
    qrStatus.textContent = 'Erro: ' + err.message;
    log('Erro ao gerar QR: ' + err.message, 'err', err);
  }finally{
    qrSpin.hidden = true;
  }
});

// ---------- DISCONNECT ----------
$('#disconnectBtn')?.addEventListener('click', async ()=>{
  try {
    const res = await fetch('/api/disconnect', { method:'POST' });
    const data = await res.json();
    log('Sessão desconectada.', 'ok', data);
    qrStatus.textContent = 'Sessão desconectada. Gere novo QR.';
    qrImage.hidden = true;
  } catch(err) {
    log('Erro ao desconectar: ' + err.message, 'err');
  }
});

// ---------- RESTART ----------
$('#restartBtn')?.addEventListener('click', async ()=>{
  try {
    const res = await fetch('/api/restart', { method:'POST' });
    const data = await res.json();
    log('Instância reiniciada.', 'ok', data);
    qrStatus.textContent = 'Instância reiniciada. Gere novo QR.';
    qrImage.hidden = true;
  } catch(err) {
    log('Erro ao reiniciar: ' + err.message, 'err');
  }
});
