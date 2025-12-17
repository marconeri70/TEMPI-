const STORAGE_KEY = "tempi_flex_v1";

const SAMPLE = {
  ZONA1: [
    { time: 14.73,  desc: "TRMPO CICLO Robot R 01 Anello Interno" },
    { time: 23.808, desc: "TRMPO CICLO Robot R 01 Anello Esterno" },
    { time: 21.792, desc: "TRMPO CICLO Robot R 02" },
    { time: 21.996, desc: "TRMPO CICLO Robot R 03" },
    { time: 23.353, desc: "TRMPO CICLO Robot R 01 Prelievo gabbie TN9" },
    { time: 23.489, desc: "TRMPO CICLO Robot R 05" }
  ],
  ZONA2: [
    { time: 23.246, desc: "TRMPO CICLO Robot R07 " },
    { time: 1.391,  desc: "TRMPO CICLO OP170-Rumorosità lato A" },
    { time: 1.236,  desc: "TRMPO CICLO OP170-Rumorosità lato B" },
    { time: 23.287, desc: "TRMPO CICLO Robot R08" },
    { time: 2.281,  desc: "TRMPO CICLO Robot R09" },
    { time: 23.535, desc: "TRMPO CICLO Robot OP125C-Cartesiano IO-Link" }
  ],
  ZONA3: [
    { time: 28.313, desc: "TRMPO CICLO Robot R10" },
    { time: 28.171, desc: "TRMPO CICLO Robot R11" },
    { time: 28.166, desc: "TRMPO CICLO Robot R12" },
    { time: 28.036, desc: "TRMPO CICLO Robot R14" },
    { time: 12.188, desc: "TRMPO CICLO OP210-Sistema di pesatura -Pre-ing." }
  ]
};

let state = loadState();
let currentView = "ZONA1";

// modale
let editingIndex = null;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const els = {
  tabs: $$(".tab"),
  viewZone: $("#viewZone"),
  viewSummary: $("#viewSummary"),

  zoneTitle: $("#zoneTitle"),
  zoneAvg: $("#zoneAvg"),
  zoneCount: $("#zoneCount"),
  zoneTbody: $("#zoneTbody"),

  btnAddRow: $("#btnAddRow"),
  btnReset: $("#btnReset"),
  btnExport: $("#btnExport"),
  importJson: $("#importJson"),

  importCsv: $("#importCsv"),
  btnExportCsv: $("#btnExportCsv"),

  avgZ1: $("#avgZ1"),
  avgZ2: $("#avgZ2"),
  avgZ3: $("#avgZ3"),
  globalAvg: $("#globalAvg"),
  bars: $("#bars"),

  saveState: $("#saveState"),

  // modal
  editModal: $("#editModal"),
  modalClose: $("#modalClose"),
  modalCancel: $("#modalCancel"),
  modalSave: $("#modalSave"),
  modalTime: $("#modalTime"),
  modalDesc: $("#modalDesc"),
  modalZone: $("#modalZone")
};

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return structuredClone(SAMPLE);
    const parsed = JSON.parse(raw);
    return {
      ZONA1: Array.isArray(parsed.ZONA1) ? parsed.ZONA1 : structuredClone(SAMPLE.ZONA1),
      ZONA2: Array.isArray(parsed.ZONA2) ? parsed.ZONA2 : structuredClone(SAMPLE.ZONA2),
      ZONA3: Array.isArray(parsed.ZONA3) ? parsed.ZONA3 : structuredClone(SAMPLE.ZONA3)
    };
  }catch{
    return structuredClone(SAMPLE);
  }
}

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  els.saveState.textContent = `Salvato: ${new Date().toLocaleString("it-IT")}`;
}

function num(x){
  const v = Number(x);
  return Number.isFinite(v) ? v : null;
}

function avgOfRows(rows){
  const values = rows.map(r => num(r.time)).filter(v => v !== null);
  if(values.length === 0) return null;
  const sum = values.reduce((a,b)=>a+b,0);
  return sum / values.length;
}

function fmt(x){
  if(x === null || x === undefined) return "—";
  let s = (Math.round(x * 10000) / 10000).toFixed(4);
  s = s.replace(/\.?0+$/,"");
  return s.replace(".", ",");
}

function escapeAttr(v){
  return String(v ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("\"","&quot;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

function setActiveTab(view){
  currentView = view;
  els.tabs.forEach(t => t.classList.toggle("tab--active", t.dataset.view === view));
  render();
}

function render(){
  if(currentView === "RIEPILOGO"){
    els.viewZone.classList.add("hidden");
    els.viewSummary.classList.remove("hidden");
    renderSummary();
    return;
  }
  els.viewSummary.classList.add("hidden");
  els.viewZone.classList.remove("hidden");
  renderZone(currentView);
}

function renderZone(zoneKey){
  const rows = state[zoneKey] || [];
  els.zoneTitle.textContent = zoneKey.replace("ZONA","ZONA ");
  els.zoneCount.textContent = String(rows.length);

  const a = avgOfRows(rows);
  els.zoneAvg.textContent = fmt(a);

  els.zoneTbody.innerHTML = "";
  rows.forEach((row, idx) => {
    const tr = document.createElement("tr");

    const tdTime = document.createElement("td");
    tdTime.innerHTML = `<input class="inp" inputmode="decimal" type="number" step="0.001" value="${escapeAttr(row.time)}" data-k="time" data-i="${idx}">`;

    const tdDesc = document.createElement("td");
    tdDesc.innerHTML = `<input class="inp" type="text" value="${escapeAttr(row.desc)}" data-k="desc" data-i="${idx}" title="${escapeAttr(row.desc)}">`;

    const tdAct = document.createElement("td");
    tdAct.innerHTML = `
      <div class="rowActions">
        <button class="iconBtn" title="Apri popup (descrizione completa)" data-edit="${idx}">✎</button>
        <button class="iconBtn iconBtn--danger" title="Elimina" data-del="${idx}">✖</button>
      </div>
    `;

    tr.appendChild(tdTime);
    tr.appendChild(tdDesc);
    tr.appendChild(tdAct);
    els.zoneTbody.appendChild(tr);
  });
}

function renderSummary(){
  const a1 = avgOfRows(state.ZONA1);
  const a2 = avgOfRows(state.ZONA2);
  const a3 = avgOfRows(state.ZONA3);

  els.avgZ1.textContent = fmt(a1);
  els.avgZ2.textContent = fmt(a2);
  els.avgZ3.textContent = fmt(a3);

  const avgs = [a1,a2,a3].filter(v => v !== null);
  const global = avgs.length ? (avgs.reduce((p,c)=>p+c,0) / avgs.length) : null;
  els.globalAvg.textContent = fmt(global);

  const items = [
    { label:"Z1", value:a1 },
    { label:"Z2", value:a2 },
    { label:"Z3", value:a3 }
  ];
  const max = Math.max(...items.map(i => (i.value ?? 0)), 0) || 1;

  els.bars.innerHTML = "";
  items.forEach(it => {
    const pct = it.value === null ? 0 : Math.max(0, Math.min(100, (it.value / max) * 100));
    const row = document.createElement("div");
    row.className = "barRow";
    row.innerHTML = `
      <div class="barLabel">${it.label}</div>
      <div class="barTrack"><div class="barFill" style="width:${pct}%"></div></div>
      <div class="barVal">${fmt(it.value)}</div>
    `;
    els.bars.appendChild(row);
  });
}

/* ===== MODALE ===== */
function openModal(idx){
  editingIndex = idx;
  const row = state[currentView][idx];
  if(!row) return;

  els.modalZone.textContent = `${currentView.replace("ZONA","ZONA ")} — Riga ${idx + 1}`;
  els.modalTime.value = (row.time ?? "");
  els.modalDesc.value = (row.desc ?? "");

  els.editModal.classList.remove("hidden");
  els.modalDesc.focus();
}

function closeModal(){
  els.editModal.classList.add("hidden");
  editingIndex = null;
}

els.modalClose.addEventListener("click", closeModal);
els.modalCancel.addEventListener("click", closeModal);
els.editModal.addEventListener("click", (e) => {
  const target = e.target;
  if(target && target.hasAttribute && target.hasAttribute("data-modal-close")) closeModal();
});

els.modalSave.addEventListener("click", () => {
  if(editingIndex === null) return;
  const row = state[currentView][editingIndex];
  if(!row) return;

  const t = els.modalTime.value === "" ? "" : Number(els.modalTime.value);
  row.time = (t === "" || Number.isFinite(t)) ? t : row.time;
  row.desc = els.modalDesc.value;

  saveState();
  renderZone(currentView);
  closeModal();
});

/* EVENTI */
els.tabs.forEach(t => t.addEventListener("click", () => setActiveTab(t.dataset.view)));

els.btnAddRow.addEventListener("click", () => {
  if(currentView === "RIEPILOGO") return;
  state[currentView].push({ time: 0, desc: "" });
  saveState();
  renderZone(currentView);
});

els.zoneTbody.addEventListener("input", (e) => {
  const inp = e.target;
  if(!(inp instanceof HTMLInputElement)) return;
  const i = Number(inp.dataset.i);
  const k = inp.dataset.k;
  if(!Number.isInteger(i) || !k) return;

  const row = state[currentView][i];
  if(!row) return;

  if(k === "time"){
    row.time = inp.value === "" ? "" : Number(inp.value);
  }else if(k === "desc"){
    row.desc = inp.value;
  }
  saveState();

  const a = avgOfRows(state[currentView]);
  els.zoneAvg.textContent = fmt(a);
  els.zoneCount.textContent = String(state[currentView].length);
});

els.zoneTbody.addEventListener("click", (e) => {
  const el = e.target;
  if(!(el instanceof HTMLElement)) return;

  const edit = el.getAttribute("data-edit");
  if(edit !== null){
    const idx = Number(edit);
    if(Number.isInteger(idx)) openModal(idx);
    return;
  }

  const del = el.getAttribute("data-del");
  if(del !== null){
    const idx = Number(del);
    if(!Number.isInteger(idx)) return;
    state[currentView].splice(idx, 1);
    saveState();
    renderZone(currentView);
  }
});

els.btnReset.addEventListener("click", () => {
  state = structuredClone(SAMPLE);
  saveState();
  render();
});

els.btnExport.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tempi-flex-export.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

els.importJson.addEventListener("change", async () => {
  const f = els.importJson.files?.[0];
  if(!f) return;
  try{
    const txt = await f.text();
    const parsed = JSON.parse(txt);
    state = {
      ZONA1: Array.isArray(parsed.ZONA1) ? parsed.ZONA1 : structuredClone(SAMPLE.ZONA1),
      ZONA2: Array.isArray(parsed.ZONA2) ? parsed.ZONA2 : structuredClone(SAMPLE.ZONA2),
      ZONA3: Array.isArray(parsed.ZONA3) ? parsed.ZONA3 : structuredClone(SAMPLE.ZONA3)
    };
    saveState();
    render();
  }catch{
    alert("File JSON non valido.");
  }finally{
    els.importJson.value = "";
  }
});

// IMPORT CSV zona: colonna A=tempo, colonna B=descrizione
els.importCsv.addEventListener("change", async () => {
  const f = els.importCsv.files?.[0];
  if(!f) return;
  try{
    const txt = await f.text();
    const rows = parseCsv(txt);
    const mapped = rows
      .map(r => ({ time: Number(String(r[0] ?? "").replace(",", ".")), desc: String(r[1] ?? "").trim() }))
      .filter(r => Number.isFinite(r.time) || r.desc.length > 0);

    state[currentView] = mapped.map(r => ({
      time: Number.isFinite(r.time) ? r.time : 0,
      desc: r.desc
    }));

    saveState();
    renderZone(currentView);
  }catch{
    alert("CSV non valido. Deve avere almeno 2 colonne: Tempo;Descrizione");
  }finally{
    els.importCsv.value = "";
  }
});

els.btnExportCsv.addEventListener("click", () => {
  if(currentView === "RIEPILOGO") return;
  const rows = state[currentView] || [];
  const lines = ["Tempo;Descrizione"];
  rows.forEach(r => {
    const t = String(r.time ?? "").replace(".", ",");
    const d = String(r.desc ?? "").replaceAll(";", ",");
    lines.push(`${t};${d}`);
  });
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${currentView.toLowerCase()}-export.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

function parseCsv(text){
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if(lines.length === 0) return [];
  const sep = lines[0].includes(";") ? ";" : ",";
  const out = [];
  for(let i=0;i<lines.length;i++){
    const parts = lines[i].split(sep).map(s => s.trim().replace(/^"|"$/g,""));
    if(i===0 && /tempo/i.test(parts[0] || "")) continue;
    out.push(parts);
  }
  return out;
}

// Service Worker (PWA)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(()=>{});
}

render();
saveState();
