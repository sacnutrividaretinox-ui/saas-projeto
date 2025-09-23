// Helpers
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// UI elements
const menuToggle = $('#menuToggle');
const sidebar = $('#sidebar');
const connStatus = $('#connStatus');
const statusText = $('#statusText');
const refreshStatus = $('#refreshStatus');
const generateQrBtn = $('#generateQrBtn');
const qrSpin = $('#qrSpin');
const qrImage = $('#qrImage');
const qrStatus = $('#qrStatus');
const fileInput = $('#fileInput');
const contactsTableBody = $('#contactsTable tbody');
const clearContacts = $('#clearContacts');
const sendBulkBtn = $('#sendBulk');
const bulkDelayInput = $('#bulkDelay');
const phoneInput = $('#phone');
const singleDelayInput = $('#singleDelay');
const messageInput = $('#message');
const sendBtn = $('#sendBtn');
const clearMsgBtn = $('#clearMsg');
const previewText = $('#previewText');
const serverResponse = $('#serverResponse');
const historyWrap = $('#history');
const clearHistoryBtn = $('#clearHistory');
const exportHistoryBtn = $('#exportHistory');
const tplName = $('#tplName');
const tplSelect = $('#tplSelect');
const saveTpl = $('#saveTpl');
const deleteTpl = $('#deleteTpl');
const applyTpl = $('#applyTpl');

// State
let contacts = []; // {phone, name}
let historyData = JSON.parse(localStorage.getItem('ms_history') || '[]');
let templates = JSON.parse(localStorage.getItem('ms_templates') || '[]');

/* ---------- SIDEBAR ---------- */
menuToggle?.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

/* ---------- STATUS ---------- */
async function fetchStatus(showToast=false){
  try{
    const res = await fetch('/api/status');
    const data = await res.json();
    statusText.textContent = data?.message || 'Online';
    connStatus.textContent = 'OK';
    connStatus.className = 'badge badge-ok';
    if(showToast) log('Status atualizado', 'ok');
  }catch(err){
    connStatus.textContent = 'OFF';
    connStatus.className = 'badge badge-err';
    statusText.textContent = 'Servidor indisponível';
    if(showToast) log('Erro ao checar status: '+ err.message, 'err');
  }
}
refreshStatus?.addEventListener('click', () => fetchStatus(true));
setInterval(fetchStatus, 10000);
fetchStatus();

/* ---------- QR CODE ---------- */
generateQrBtn?.addEventListener('click', async ()=>{
  qrSpin.hidden = false;
  qrImage.hidden = true;
  qrStatus.textContent = 'Gerando QR Code...';
  try{
    await sleep(1500); // anti flood
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

/* ---------- CSV CONTACTS ---------- */
function parseCSV(text){
  return text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length)
    .map((line, idx) => {
      const [c1='', c2=''] = line.split(',').map(s => s.trim());
      let phone = c1.replace(/\D/g,'');
      let name = c2 || `Contato ${idx+1}`;
      if(idx===0 && /phone|telefone/i.test(c1)) return null;
      return phone ? {phone, name} : null;
    })
    .filter(Boolean);
}

function renderContacts(){
  contactsTableBody.innerHTML = '';
  contacts.forEach((c, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>${c.phone}</td>
      <td>${c.name || ''}</td>
      <td>
        <button class="mini-btn btn" data-action="remove" data-idx="${i}">Remover</button>
      </td>`;
    contactsTableBody.appendChild(tr);
  });
}

fileInput?.addEventListener('change', async (e)=>{
  const file = e.target.files?.[0];
  if(!file) return;
  const text = await file.text();
  const parsed = parseCSV(text);
  contacts = parsed;
  renderContacts();
  log(`CSV carregado: ${contacts.length} contato(s).`, 'ok');
});

contactsTableBody?.addEventListener('click', (e)=>{
  const btn = e.target.closest('button[data-action="remove"]');
  if(!btn) return;
  const idx = +btn.dataset.idx;
  contacts.splice(idx, 1);
  renderContacts();
});

clearContacts?.addEventListener('click', ()=>{
  contacts = [];
  renderContacts();
});

/* ---------- MESSAGE COMPOSER ---------- */
function updatePreview(){
  previewText.textContent = messageInput.value || 'Sua mensagem aparecerá aqui…';
}
messageInput?.addEventListener('input', updatePreview);
updatePreview();

clearMsgBtn?.addEventListener('click', ()=>{
  phoneInput.value=''; messageInput.value=''; updatePreview();
});

/* ---------- TEMPLATES ---------- */
function renderTemplates(){
  tplSelect.innerHTML = '';
  templates.forEach((t, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${t.name} — ${new Date(t.ts).toLocaleString()}`;
    tplSelect.appendChild(opt);
  });
}
renderTemplates();

saveTpl?.addEventListener('click', ()=>{
  const name = (tplName.value || '').trim() || 'Sem nome';
  const text = messageInput.value || '';
  templates.push({name, text, ts: Date.now()});
  localStorage.setItem('ms_templates', JSON.stringify(templates));
  renderTemplates();
  tplName.value = '';
  log('Template salvo.', 'ok');
});
deleteTpl?.addEventListener('click', ()=>{
  const idx = +tplSelect.value;
  if(Number.isNaN(idx)) return;
  templates.splice(idx,1);
  localStorage.setItem('ms_templates', JSON.stringify(templates));
  renderTemplates();
  log('Template excluído.', 'ok');
});
applyTpl?.addEventListener('click', ()=>{
  const idx = +tplSelect.value;
  if(Number.isNaN(idx)) return;
  messageInput.value = templates[idx].text;
  updatePreview();
  log('Template aplicado.', 'ok');
});

/* ---------- HISTORY & LOG ---------- */
function log(msg, level='ok', raw=null){
  const time = new Date().toLocaleTimeString();
  serverResponse.textContent = `[${time}] ${msg}\n` + serverResponse.textContent;
  const pill = document.createElement('div');
  pill.className = 'pill ' + (level==='ok' ? 'ok' : level==='err' ? 'err' : '');
  pill.textContent = msg;
  historyWrap.prepend(pill);
  historyData.unshift({time: Date.now(), level, msg, raw});
  historyData = historyData.slice(0, 100);
  localStorage.setItem('ms_history', JSON.stringify(historyData));
}
function renderHistoryFromStore(){
  historyWrap.innerHTML='';
  historyData.slice(0, 20).reverse().forEach(h => {
    const pill = document.createElement('div');
    pill.className = 'pill ' + (h.level==='ok' ? 'ok' : h.level==='err' ? 'err' : '');
    pill.textContent = h.msg;
    historyWrap.appendChild(pill);
  });
}
renderHistoryFromStore();

clearHistoryBtn?.addEventListener('click', ()=>{
  historyData = [];
  localStorage.setItem('ms_history', '[]');
  renderHistoryFromStore();
  serverResponse.textContent='';
});
exportHistoryBtn?.addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(historyData, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'history.json'; a.click();
  URL.revokeObjectURL(url);
});

/* ---------- SEND SINGLE ---------- */
sendBtn?.addEventListener('click', async ()=>{
  const phone = (phoneInput.value || '').trim();
  const message = (messageInput.value || '').trim();
  const delay = +singleDelayInput.value || 0;
  if(!phone || !message){ log('Informe telefone e mensagem.', 'err'); return; }
  try{
    sendBtn.disabled = true; sendBtn.textContent = 'Enviando…';
    if(delay) await sleep(delay);
    const res = await fetch('/api/send-message', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ phone, message })
    });
    const data = await res.json();
    if(res.ok){
      log(`Enviado para ${phone}.`, 'ok', data);
    }else{
      throw new Error(data?.error || 'Falha no envio');
    }
  }catch(err){
    log('Erro envio single: ' + err.message, 'err');
  }finally{
    sendBtn.disabled = false; sendBtn.textContent = 'Enviar';
  }
});

/* ---------- SEND BULK ---------- */
sendBulkBtn?.addEventListener('click', async ()=>{
  if(!contacts.length){ log('Nenhum contato carregado.', 'err'); return; }
  const message = (messageInput.value || '').trim();
  if(!message){ log('Digite a mensagem para envio em massa.', 'err'); return; }
  const delay = Math.max(0, +bulkDelayInput.value || 0);
  sendBulkBtn.disabled = true; sendBulkBtn.textContent = 'Enviando em Massa…';
  let success=0, fail=0;
  for(let i=0; i<contacts.length; i++){
    const {phone, name} = contacts[i];
    const personalized = message.replace(/\{\{nome\}\}/gi, name || '');
    try{
      const res = await fetch('/api/send-message', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ phone, message: personalized })
      });
      const data = await res.json();
      if(res.ok){ success++; log(`OK ${i+1}/${contacts.length} → ${phone}`, 'ok'); }
      else{ fail++; log(`ERRO ${i+1}/${contacts.length} → ${phone}: ${data?.error||'Falha'}`, 'err'); }
    }catch(err){
      fail++; log(`ERRO ${i+1}/${contacts.length} → ${phone}: ${err.message}`, 'err');
    }
    if(i < contacts.length-1 && delay) await sleep(delay);
  }
  log(`Massa finalizada. Sucesso: ${success} | Falhas: ${fail}`, fail? 'err':'ok');
  sendBulkBtn.disabled = false; sendBulkBtn.textContent = 'Enviar em Massa';
});
