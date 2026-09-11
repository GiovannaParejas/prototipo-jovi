let dragSrc = null;
let longPressTimer = null;
let isDragging = false;

const fotosFixas = [
  {
    src: "../assets/digitalizacao.png",
    titulo: "Design Thinking - Process",
    nota: 2,
    tipo: "estudo",
  },
  {
    src: "../assets/holiday.png",
    titulo: "Holiday at Sea",
    nota: 0,
    tipo: "estudo",
  },
  {
    src: "../assets/traducao.png",
    titulo: "Férias no Mar (Tradução)",
    nota: 1,
    tipo: "estudo",
  },
  {
    src: "../assets/sapo-zoo.jpeg",
    titulo: "Zoo - São Paulo",
    nota: null,
    tipo: "pessoal",
  },
  {
    src: "../assets/elefante-zoo.jpeg",
    titulo: "Zoo - São Paulo",
    nota: null,
    tipo: "pessoal",
  },
  {
    src: "../assets/jacare-zoo.jpeg",
    titulo: "Zoo - São Paulo",
    nota: null,
    tipo: "pessoal",
  },
];

const fotosExtras = JSON.parse(localStorage.getItem("fotos_extras") || "[]");
const fotos = [...fotosFixas, ...fotosExtras];

setTimeout(() => {
  const fotosExtrasAtualizadas = JSON.parse(
    localStorage.getItem("fotos_extras") || "[]",
  );
  const todasFotos = [...fotosFixas, ...fotosExtrasAtualizadas];

  fotos.length = 0;
  todasFotos.forEach((f) => fotos.push(f));

  renderizarPastas();
}, 0);
let fotoAtual = null;
let fotoAtualContexto = null;

const params = new URLSearchParams(window.location.search);
const fotoParam = params.get("foto");
if (fotoParam !== null) abrirFoto(parseInt(fotoParam));

function renderizarAcoesFoto(index) {
  const acoes = document.querySelector(".foto-acoes");
  acoes.innerHTML = `
    <button class="acao-btn" id="btn-esquerda">
      <span class="material-icons">share</span>
      <span>Compartilhar</span>
    </button>
    <button class="acao-btn" onclick="abrirPDF()">
      <span class="material-icons">picture_as_pdf</span>
      <span>PDF</span>
    </button>
    <button class="acao-btn" onclick="abrirAnotacoes()">
      <span class="material-icons">bookmark</span>
      <span>Anotações</span>
    </button>
    <button class="acao-btn" onclick="abrirResumo()">
      <span class="material-icons">summarize</span>
      <span>Resumo</span>
    </button>
    <button class="acao-btn" onclick="organizarComIA(${index})">
      <span class="material-icons">auto_awesome</span>
      <span>Organizar</span>
    </button>
    <button class="acao-btn" onclick="traduzirFoto()">
      <span class="material-icons">translate</span>
      <span>Traduzir</span>
    </button>
  `;
}

function abrirFoto(index, contexto = null) {
  fotoAtual = index;
  fotoAtualContexto = contexto;
  const foto = fotos[index];
  document.getElementById("foto-ampliada").src = foto.src;
  document.getElementById("foto-titulo").textContent = foto.titulo;
  document.getElementById("tela-galeria").classList.add("oculto");
  document.getElementById("tela-foto").classList.remove("oculto");
  fecharMenuAnotacoes();
  fecharGrifar();
  fecharPDF();
  renderizarAcoesFoto(index);
}
function fecharFoto() {
  document.getElementById("tela-foto").classList.add("oculto");
  fecharMenuAnotacoes();
  fecharGrifar();
  fecharPDF();

  if (pastaAtual) {
    document.getElementById("tela-pasta").classList.remove("oculto");
  } else {
    document.getElementById("tela-galeria").classList.remove("oculto");
  }
}

function voltarOuHistorico() {
  const pdfAberto = !document
    .getElementById("tela-pdf")
    .classList.contains("oculto");
  if (pdfAberto) {
    fecharVisualizadorPDF();
    return;
  }
  const pastaAberta = !document
    .getElementById("tela-pasta")
    .classList.contains("oculto");
  if (pastaAberta) {
    fecharPasta();
    return;
  }
  const fotoAberta = !document
    .getElementById("tela-foto")
    .classList.contains("oculto");
  if (fotoAberta) {
    fecharFoto();
    return;
  }
  history.back();
}

function abrirAnotacoes() {
  fecharGrifar();
  fecharPDF();
  document.getElementById("menu-anotacoes").classList.remove("oculto");
}

function fecharMenuAnotacoes() {
  document.getElementById("menu-anotacoes").classList.add("oculto");
}

// --- IA: reconhecimento de conteúdo das fotos (mesma API/chave do Google usada na câmera) ---

async function converterParaDataUrl(src) {
  if (src.startsWith("data:")) return src;
  const resposta = await fetch(src);
  const blob = await resposta.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function extrairImagemBase64(src) {
  const dataUrl = await converterParaDataUrl(src);
  return dataUrl.split(",")[1];
}

function formatoImagemDoDataUrl(dataUrl) {
  const match = dataUrl.match(/^data:image\/(\w+);/);
  const tipo = match ? match[1].toLowerCase() : "png";
  return tipo === "jpg" ? "JPEG" : tipo.toUpperCase();
}

async function reconhecerFotoComGemini(src, modo = "copiar", idioma = "português") {
  const imageBase64 = await extrairImagemBase64(src);
  const response = await fetch("https://prototipo-jovi.vercel.app/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64, modo, idioma }),
  });

  const data = await response.json();
  if (data.erro) throw new Error(data.erro);
  return data.texto;
}

async function abrirNota() {
  const foto = fotos[fotoAtual];
  fecharMenuAnotacoes();
  mostrarAviso("Lendo conteúdo da foto...");

  try {
    const texto = await reconhecerFotoComGemini(foto.src, "copiar");
    sessionStorage.setItem("nota_titulo", foto.titulo);
    sessionStorage.setItem("nota_corpo", texto);
    window.location.href = "nota-editor.html";
  } catch (err) {
    console.error("Erro ao ler conteúdo da foto:", err);
    mostrarAviso("Não foi possível ler o conteúdo da foto.");
  }
}

function abrirGrifar() {
  fecharMenuAnotacoes();
  document.getElementById("overlay-grifar").classList.remove("oculto");
  document.querySelector(".foto-header").style.display = "none";
  document.querySelector(".foto-acoes").style.display = "none";
  document.querySelector(".barra-inferior").style.display = "none";

  const canvasExistente = document.getElementById("canvas-grifo");
  if (canvasExistente) canvasExistente.remove();

  const visualizacao = document.querySelector(".foto-visualizacao");
  const rect = visualizacao.getBoundingClientRect();
  const canvas = document.createElement("canvas");
  canvas.id = "canvas-grifo";
  canvas.width = rect.width;
  canvas.height = rect.height;
  visualizacao.style.position = "relative";
  visualizacao.appendChild(canvas);

  let startX,
    startY,
    drawing = false;
  const ctx = canvas.getContext("2d");
  const grifos = [];

  function redesenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grifos.forEach((g) => {
      ctx.fillStyle = "rgba(200, 255, 0, 0.35)";
      ctx.fillRect(g.x, g.y, g.w, g.h);
    });
  }

  canvas.addEventListener("mousedown", (e) => {
    const r = canvas.getBoundingClientRect();
    startX = e.clientX - r.left;
    startY = e.clientY - r.top;
    drawing = true;
  });
  canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;
    const r = canvas.getBoundingClientRect();
    redesenhar();
    ctx.fillStyle = "rgba(200, 255, 0, 0.35)";
    ctx.fillRect(
      startX,
      startY,
      e.clientX - r.left - startX,
      e.clientY - r.top - startY,
    );
  });
  canvas.addEventListener("mouseup", (e) => {
    if (!drawing) return;
    drawing = false;
    const r = canvas.getBoundingClientRect();
    grifos.push({
      x: startX,
      y: startY,
      w: e.clientX - r.left - startX,
      h: e.clientY - r.top - startY,
    });
  });
  canvas.addEventListener("touchstart", (e) => {
    const r = canvas.getBoundingClientRect();
    startX = e.touches[0].clientX - r.left;
    startY = e.touches[0].clientY - r.top;
    drawing = true;
  });
  canvas.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      if (!drawing) return;
      const r = canvas.getBoundingClientRect();
      redesenhar();
      ctx.fillStyle = "rgba(200, 255, 0, 0.35)";
      ctx.fillRect(
        startX,
        startY,
        e.touches[0].clientX - r.left - startX,
        e.touches[0].clientY - r.top - startY,
      );
    },
    { passive: false },
  );
  canvas.addEventListener("touchend", (e) => {
    if (!drawing) return;
    drawing = false;
    const r = canvas.getBoundingClientRect();
    grifos.push({
      x: startX,
      y: startY,
      w: e.changedTouches[0].clientX - r.left - startX,
      h: e.changedTouches[0].clientY - r.top - startY,
    });
  });
}

function fecharGrifar() {
  document.getElementById("overlay-grifar").classList.add("oculto");
  document.querySelector(".foto-header").style.display = "";
  document.querySelector(".foto-acoes").style.display = "";
  document.querySelector(".barra-inferior").style.display = "";
  const canvas = document.getElementById("canvas-grifo");
  if (canvas) canvas.remove();
}

function confirmarGrifar() {
  const canvas = document.getElementById("canvas-grifo");
  const visualizacao = document.querySelector(".foto-visualizacao");
  const img = visualizacao.querySelector("img");

  if (canvas) {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext("2d");

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(canvas, 0, 0);

    img.src = tempCanvas.toDataURL("image/png");
    canvas.remove();
  }

  document.getElementById("overlay-grifar").classList.add("oculto");
  document.querySelector(".foto-header").style.display = "";
  document.querySelector(".foto-acoes").style.display = "";
  document.querySelector(".barra-inferior").style.display = "";
}

function abrirPDF() {
  fecharGrifar();
  fecharMenuAnotacoes();
  document.getElementById("menu-pdf").classList.remove("oculto");
}

function fecharPDF() {
  document.getElementById("menu-pdf").classList.add("oculto");
}

let pdfTipoAtual = null;
let pdfTextoAtual = null;

async function abrirVisualizadorPDF(tipo) {
  fecharPDF();
  document.getElementById("tela-foto").classList.add("oculto");
  document.getElementById("tela-pdf").classList.remove("oculto");
  document.getElementById("pdf-titulo").textContent =
    tipo === "texto" ? "Texto em PDF" : "Foto em PDF";

  pdfTipoAtual = tipo;
  pdfTextoAtual = null;

  const foto = fotos[fotoAtual];
  const visualizacao = document.querySelector(".pdf-visualizacao");

  if (tipo === "foto") {
    visualizacao.innerHTML = `<div class="pdf-pagina"><img src="${foto.src}" alt="PDF"></div>`;
    return;
  }

  visualizacao.innerHTML = `<p class="pdf-carregando">Lendo conteúdo da foto...</p>`;

  try {
    const texto = await reconhecerFotoComGemini(foto.src, "copiar");
    pdfTextoAtual = texto;
    const pagina = document.createElement("div");
    pagina.className = "pdf-pagina pdf-pagina-texto";
    pagina.textContent = texto;
    visualizacao.innerHTML = "";
    visualizacao.appendChild(pagina);
  } catch (err) {
    console.error("Erro ao extrair texto da foto:", err);
    visualizacao.innerHTML = `<p class="pdf-carregando">Não foi possível ler o conteúdo da foto.</p>`;
  }
}

function fecharVisualizadorPDF() {
  document.getElementById("tela-pdf").classList.add("oculto");
  document.getElementById("tela-foto").classList.remove("oculto");
}

async function baixarPDF() {
  const foto = fotos[fotoAtual];
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  if (pdfTipoAtual === "foto") {
    const dataUrl = await converterParaDataUrl(foto.src);
    const formato = formatoImagemDoDataUrl(dataUrl);
    const propriedades = doc.getImageProperties(dataUrl);
    const largura = doc.internal.pageSize.getWidth() - 20;
    const altura = (propriedades.height * largura) / propriedades.width;
    doc.addImage(dataUrl, formato, 10, 10, largura, altura);
  } else {
    doc.setFontSize(12);
    const linhas = doc.splitTextToSize(pdfTextoAtual || "", 180);
    doc.text(linhas, 10, 15);
  }

  const nomeArquivo = `${foto.titulo.replace(/[^\w\s-]/g, "").trim() || "documento"}.pdf`;
  doc.save(nomeArquivo);
}

async function abrirResumo() {
  const foto = fotos[fotoAtual];
  mostrarAviso("Lendo conteúdo da foto...");

  try {
    const texto = await reconhecerFotoComGemini(foto.src, "copiar");
    sessionStorage.setItem("ia_foto_titulo", foto.titulo);
    sessionStorage.setItem("ia_foto_texto", texto);
    window.location.href = "ia.html?foto=1";
  } catch (err) {
    console.error("Erro ao ler conteúdo da foto:", err);
    mostrarAviso("Não foi possível ler o conteúdo da foto.");
  }
}

async function organizarComIA(index) {
  const foto = fotos[index];
  mostrarAviso("Analisando com IA...");

  try {
    const materiaBruta = await reconhecerFotoComGemini(foto.src, "materia");
    const nomePasta = materiaBruta.trim().replace(/[.]+$/, "");
    if (!nomePasta) throw new Error("A IA não identificou uma matéria.");

    ["fotos_estudo_removidas", "fotos_pessoal_removidas"].forEach((chave) => {
      const lista = JSON.parse(localStorage.getItem(chave) || "[]");
      localStorage.setItem(chave, JSON.stringify(lista.filter((i) => i !== index)));
    });

    const pastasExcluidas = JSON.parse(localStorage.getItem("pastas_excluidas") || "[]");
    const pastasFixasNomes = ["Software e Total Experience", "Inglês"].filter(
      (n) => !pastasExcluidas.includes(n),
    );
    const pastasExtras = JSON.parse(localStorage.getItem("pastas_extras") || "[]");

    const nomeFixoExistente = pastasFixasNomes.find(
      (n) => n.toLowerCase() === nomePasta.toLowerCase(),
    );
    const pastaExtraExistente = pastasExtras.find(
      (p) => p.nome.toLowerCase() === nomePasta.toLowerCase(),
    );

    let nomePastaFinal = nomePasta;
    if (nomeFixoExistente) {
      nomePastaFinal = nomeFixoExistente;
    } else if (pastaExtraExistente) {
      nomePastaFinal = pastaExtraExistente.nome;
    } else {
      pastasExtras.push({ nome: nomePasta, fotos: [] });
      localStorage.setItem("pastas_extras", JSON.stringify(pastasExtras));
    }

    adicionarFotoNaPastaSilenciosa(nomePastaFinal, index);
    renderizarPastas();
    mostrarAviso(`Foto organizada em "${nomePastaFinal}"!`);
  } catch (err) {
    console.error("Erro ao organizar foto com IA:", err);
    mostrarAviso("Não foi possível organizar a foto agora.");
  }
}

async function traduzirFoto() {
  const foto = fotos[fotoAtual];
  mostrarAviso("Traduzindo com IA...");

  try {
    const texto = await reconhecerFotoComGemini(foto.src, "traduzir");
    abrirTraducaoFoto(texto);
  } catch (err) {
    console.error("Erro ao traduzir foto:", err);
    mostrarAviso("Não foi possível traduzir a foto agora.");
  }
}

function abrirTraducaoFoto(texto) {
  const celular = document.querySelector(".celular");

  const overlay = document.createElement("div");
  overlay.id = "overlay-traducao-foto";
  overlay.style.cssText = `
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.75);
    z-index: 25;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  const modal = document.createElement("div");
  modal.style.cssText = `
    background: #1A1A1A;
    border-radius: 16px;
    padding: 20px;
    width: 85%;
    max-height: 75%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    border: 1px solid #2B2B2B;
  `;

  const titulo = document.createElement("p");
  titulo.textContent = "Tradução";
  titulo.style.cssText = `color:#FFF; font-size:14px; font-weight:600; margin:0;`;

  const corpo = document.createElement("p");
  corpo.textContent = texto;
  corpo.style.cssText = `color:#CCC; font-size:13px; line-height:1.6; white-space:pre-wrap; margin:0;`;

  const btnFechar = document.createElement("button");
  btnFechar.textContent = "Fechar";
  btnFechar.style.cssText = `
    background: transparent;
    border: 1px solid #2B2B2B;
    border-radius: 10px;
    color: #888;
    padding: 8px 16px;
    font-size: 13px;
    cursor: pointer;
    align-self: flex-end;
  `;
  btnFechar.onclick = () => overlay.remove();

  modal.appendChild(titulo);
  modal.appendChild(corpo);
  modal.appendChild(btnFechar);
  overlay.appendChild(modal);
  celular.appendChild(overlay);
}

function trocarTab(modo, el) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("ativo"));
  el.classList.add("ativo");

  document.getElementById("view-estudo").classList.toggle("oculto", modo !== "estudo");
  document.getElementById("view-pessoal").classList.toggle("oculto", modo !== "pessoal");
  document.getElementById("view-lixeira")?.classList.toggle("oculto", modo !== "lixeira");
}

const pastas = {
  "Software e Total Experience": [0],
  Inglês: [1, 2],
};

let pastaAtual = null;

function abrirSeletorFotos(nomePasta) {
  const celular = document.querySelector(".celular");

  const overlay = document.createElement("div");
  overlay.id = "overlay-seletor-fotos";
  overlay.style.cssText = `
    position: absolute;
    bottom: 0; left: 0;
    width: 100%; height: 70%;
    background: #1A1A1A;
    border-radius: 16px 16px 0 0;
    z-index: 30;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;

  const header = document.createElement("div");
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #2B2B2B;
  `;
  header.innerHTML = `
    <p style="color:#FFF; font-size:14px; font-weight:600; margin:0;">Selecionar foto</p>
    <button onclick="document.getElementById('overlay-seletor-fotos').remove()" 
      style="background:transparent; border:none; color:#FFF; cursor:pointer;">
      <span class="material-icons">close</span>
    </button>
  `;

  const grid = document.createElement("div");
  grid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 3px;
    padding: 3px;
    overflow-y: auto;
    flex: 1;
  `;

  fotos.forEach((foto, index) => {
    const div = document.createElement("div");
    div.style.cssText = `
      cursor: pointer;
      position: relative;
    `;
    div.innerHTML = `<img src="${foto.src}" style="width:100%; height:auto; display:block;">`;
    div.onclick = () => adicionarFotoNaPasta(nomePasta, index, overlay);
    grid.appendChild(div);
  });

  overlay.appendChild(header);
  overlay.appendChild(grid);
  celular.appendChild(overlay);
}

function adicionarFotoNaPastaSilenciosa(nomePasta, index) {
  const pastasExtras = JSON.parse(localStorage.getItem('pastas_extras') || '[]');
  const pastaIndex = pastasExtras.findIndex(p => p.nome === nomePasta);

  if (pastaIndex !== -1) {
    if (!pastasExtras[pastaIndex].fotos.includes(index)) {
      pastasExtras[pastaIndex].fotos.push(index);
      localStorage.setItem('pastas_extras', JSON.stringify(pastasExtras));
    }
  } else {
    const pastasOverride = JSON.parse(localStorage.getItem('pastas_override') || '{}');
    if (!pastasOverride[nomePasta]) {
      pastasOverride[nomePasta] = [...(pastas[nomePasta] || [])];
    }
    if (!pastasOverride[nomePasta].includes(index)) {
      pastasOverride[nomePasta].push(index);
    }
    localStorage.setItem('pastas_override', JSON.stringify(pastasOverride));
  }
}

function adicionarFotoNaPasta(nomePasta, index, overlay) {
  adicionarFotoNaPastaSilenciosa(nomePasta, index);

  overlay.remove();
  renderizarPastas();        // ← atualiza o preview
  abrirPasta(nomePasta);     // ← reabre a pasta com a nova foto
  mostrarAviso('Foto adicionada!');
}

function ordenarPorRecencia(nome, indicesFixos, indicesExtras) {
  const baseOriginal = pastas[nome] || [];
  const adicionadas = [
    ...indicesFixos.filter((i) => !baseOriginal.includes(i)),
    ...indicesExtras,
  ];
  const originaisPresentes = baseOriginal.filter((i) => indicesFixos.includes(i));
  return [...new Set([...[...adicionadas].reverse(), ...originaisPresentes])];
}

function ordenarComOverride(nomePasta, indicesPadrao) {
  const ordensFotos = JSON.parse(localStorage.getItem("ordem_fotos_pastas") || "{}");
  const ordemSalva = ordensFotos[nomePasta];
  if (!ordemSalva || ordemSalva.length === 0) return indicesPadrao;

  const novos = indicesPadrao.filter((i) => !ordemSalva.includes(i));
  const existentes = ordemSalva.filter((i) => indicesPadrao.includes(i));
  return [...novos, ...existentes];
}

function abrirPasta(nome) {
  pastaAtual = nome;
  document.getElementById("pasta-titulo").textContent = nome;
  const grid = document.getElementById("pasta-fotos");
  grid.innerHTML = "";

  document.getElementById("btn-adicionar-pasta")?.remove();

  const pastasExtras = JSON.parse(
    localStorage.getItem("pastas_extras") || "[]",
  );
  const pastasOverride = JSON.parse(
    localStorage.getItem("pastas_override") || "{}",
  );
  const pastaExtra = pastasExtras.find((p) => p.nome === nome);
  const indicesFixos = pastasOverride[nome] || pastas[nome] || [];
  const indicesExtras = pastaExtra ? pastaExtra.fotos : [];
  const todosIndices = ordenarComOverride(
    nome,
    ordenarPorRecencia(nome, indicesFixos, indicesExtras),
  );

  todosIndices.forEach((index) => {
    const foto = fotos[index];
    if (!foto) return;
    const div = document.createElement("div");
    div.className = "foto-item";
    div.dataset.index = index;
    div.style.aspectRatio = "1";
    div.style.overflow = "hidden";
    div.style.borderRadius = "8px";
    div.style.position = "relative";
    div.innerHTML = `<img src="${foto.src}" alt="${foto.titulo}" style="width:100%;height:100%;object-fit:cover;">`;

    div.appendChild(
      criarBotaoMenuFoto((btnRef) => abrirMenuFoto(nome, index, btnRef)),
    );

    div.onclick = () => abrirFotoDaPasta(index);

    grid.appendChild(div);
  });

  const btnAdicionar = document.createElement("button");
  btnAdicionar.id = "btn-adicionar-pasta";
  btnAdicionar.style.cssText = `
    position: absolute;
    bottom: 70px;
    right: 16px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #2B7FE8;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
  `;
  btnAdicionar.innerHTML =
    '<span class="material-icons" style="color:#FFF; font-size:22px;">add</span>';
  btnAdicionar.onclick = () => abrirSeletorFotos(nome);
  document.getElementById("tela-pasta").appendChild(btnAdicionar);

  document.getElementById("tela-galeria").classList.add("oculto");
  document.getElementById("tela-pasta").classList.remove("oculto");
}

function criarBotaoMenuFoto(aoClicar) {
  const btn = document.createElement("button");
  btn.style.cssText = `
    position: absolute;
    top: 6px;
    right: 6px;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: rgba(0,0,0,0.6);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 5;
  `;
  btn.innerHTML =
    '<span class="material-icons" style="font-size:16px; color:#FFF;">more_vert</span>';
  btn.onclick = (e) => {
    e.stopPropagation();
    aoClicar(btn);
  };
  return btn;
}

function abrirMenuAcoesFoto(btnRef, opcoes) {
  document.getElementById("menu-foto-pasta")?.remove();

  const menu = document.createElement("div");
  menu.id = "menu-foto-pasta";
  menu.style.cssText = `
    position: absolute;
    background: #1A1A1A;
    border: 1px solid #2B2B2B;
    border-radius: 10px;
    padding: 4px 0;
    z-index: 100;
    min-width: 170px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  `;

  const celularRect = document
    .querySelector(".celular")
    .getBoundingClientRect();
  const btnRect = btnRef.getBoundingClientRect();
  menu.style.top = btnRect.bottom - celularRect.top + 4 + "px";
  menu.style.right = celularRect.right - btnRect.right + "px";

  opcoes.forEach((op) => {
    const btn = document.createElement("button");
    btn.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      background: transparent;
      border: none;
      padding: 10px 14px;
      color: ${op.color};
      font-size: 13px;
      cursor: pointer;
      text-align: left;
    `;
    btn.innerHTML = `<span class="material-icons" style="font-size:16px; color:${op.color};">${op.icon}</span>${op.label}`;
    btn.onclick = () => {
      menu.remove();
      op.action();
    };
    menu.appendChild(btn);
  });

  document.querySelector(".celular").appendChild(menu);

  setTimeout(() => {
    document.addEventListener("click", () => menu.remove(), { once: true });
  }, 0);
}

function abrirMenuFoto(nomePasta, index, btnRef) {
  abrirMenuAcoesFoto(btnRef, [
    {
      label: "Mover para cima",
      icon: "arrow_upward",
      color: "#FFF",
      action: () => moverFotoNaPasta(nomePasta, index, "cima"),
    },
    {
      label: "Mover para baixo",
      icon: "arrow_downward",
      color: "#FFF",
      action: () => moverFotoNaPasta(nomePasta, index, "baixo"),
    },
    {
      label: "Remover",
      icon: "delete",
      color: "#E84545",
      action: () => removerFotoDaPasta(nomePasta, index),
    },
  ]);
}

function moverFotoNaPasta(nomePasta, index, direcao) {
  const grid = document.getElementById("pasta-fotos");
  const ordemAtual = [...grid.querySelectorAll(".foto-item")].map((item) =>
    Number(item.dataset.index),
  );
  const posicao = ordemAtual.indexOf(index);
  const novaPosicao = direcao === "cima" ? posicao - 1 : posicao + 1;
  if (novaPosicao < 0 || novaPosicao >= ordemAtual.length) return;

  [ordemAtual[posicao], ordemAtual[novaPosicao]] = [
    ordemAtual[novaPosicao],
    ordemAtual[posicao],
  ];

  const ordensFotos = JSON.parse(localStorage.getItem("ordem_fotos_pastas") || "{}");
  ordensFotos[nomePasta] = ordemAtual;
  localStorage.setItem("ordem_fotos_pastas", JSON.stringify(ordensFotos));

  renderizarPastas();
  atualizarTelaPastaSePreciso(nomePasta);
}

function removerFotoDaPasta(nomePasta, index) {
  const pastasExtras = JSON.parse(localStorage.getItem("pastas_extras") || "[]");
  const pastaIndex = pastasExtras.findIndex((p) => p.nome === nomePasta);

  if (pastaIndex !== -1) {
    pastasExtras[pastaIndex].fotos = pastasExtras[pastaIndex].fotos.filter(
      (i) => i !== index,
    );
    localStorage.setItem("pastas_extras", JSON.stringify(pastasExtras));
  } else {
    const pastasOverride = JSON.parse(
      localStorage.getItem("pastas_override") || "{}",
    );
    const atuais = pastasOverride[nomePasta] || pastas[nomePasta] || [];
    pastasOverride[nomePasta] = atuais.filter((i) => i !== index);
    localStorage.setItem("pastas_override", JSON.stringify(pastasOverride));
  }

  renderizarPastas();
  atualizarTelaPastaSePreciso(nomePasta);
  mostrarAviso("Foto removida da pasta!");
}

function abrirFotoDaPasta(index) {
  fotoAtual = index;
  fotoAtualContexto = { tipo: "pasta", pasta: pastaAtual };
  const foto = fotos[index];
  document.getElementById("foto-ampliada").src = foto.src;
  document.getElementById("foto-titulo").textContent = foto.titulo;
  document.getElementById("tela-pasta").classList.add("oculto");
  document.getElementById("tela-foto").classList.remove("oculto");
  fecharMenuAnotacoes();
  fecharGrifar();
  fecharPDF();
  renderizarAcoesFoto(index);
}

function fecharPasta() {
  pastaAtual = null;
  document.getElementById("tela-pasta").classList.add("oculto");
  document.getElementById("tela-galeria").classList.remove("oculto");
}

function atualizarTelaPastaSePreciso(nomePasta) {
  const telaFotoVisivel = !document
    .getElementById("tela-foto")
    .classList.contains("oculto");
  if (!telaFotoVisivel) {
    abrirPasta(nomePasta);
  }
}

function criarPasta() {
  const wrapper = document.querySelector(".celular");

  const overlay = document.createElement("div");
  overlay.id = "overlay-nova-pasta";
  overlay.style.cssText = `
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.7);
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  const modal = document.createElement("div");
  modal.style.cssText = `
    background: #1A1A1A;
    border-radius: 16px;
    padding: 20px;
    width: 80%;
    display: flex;
    flex-direction: column;
    gap: 12px;
    border: 1px solid var(--cor-cinza-borda);
  `;

  const titulo = document.createElement("p");
  titulo.textContent = "Nome da pasta";
  titulo.style.cssText = `color: #FFF; font-size: 14px; font-weight: 600; margin: 0;`;

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Ex: Matemática";
  input.style.cssText = `
    background: #2B2B2B;
    border: 1px solid var(--cor-cinza-borda);
    border-radius: 10px;
    padding: 10px 14px;
    color: #FFF;
    font-size: 13px;
    outline: none;
  `;

  const botoes = document.createElement("div");
  botoes.style.cssText = `display: flex; gap: 8px; justify-content: flex-end;`;

  const btnCancelar = document.createElement("button");
  btnCancelar.textContent = "Cancelar";
  btnCancelar.style.cssText = `
    background: transparent;
    border: 1px solid var(--cor-cinza-borda);
    border-radius: 10px;
    color: var(--cor-texto-muted);
    padding: 8px 16px;
    font-size: 13px;
    cursor: pointer;
  `;
  btnCancelar.onclick = () => overlay.remove();

  const btnConfirmar = document.createElement("button");
  btnConfirmar.textContent = "Criar";
  btnConfirmar.style.cssText = `
    background: #2B7FE8;
    border: none;
    border-radius: 10px;
    color: #FFF;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  `;
  btnConfirmar.onclick = () => {
    const nome = input.value.trim();
    if (!nome) return;

    // Salva no localStorage
    const pastasExtras = JSON.parse(
      localStorage.getItem("pastas_extras") || "[]",
    );
    pastasExtras.push({ nome, fotos: [] });
    localStorage.setItem("pastas_extras", JSON.stringify(pastasExtras));

    overlay.remove();
    renderizarPastas();
    mostrarAviso("Pasta criada!");
  };

  botoes.appendChild(btnCancelar);
  botoes.appendChild(btnConfirmar);
  modal.appendChild(titulo);
  modal.appendChild(input);
  modal.appendChild(botoes);
  overlay.appendChild(modal);
  wrapper.appendChild(overlay);

  setTimeout(() => input.focus(), 100);
}

function excluirPasta(nome) {
  // Remove de extras
  const pastasExtras = JSON.parse(
    localStorage.getItem("pastas_extras") || "[]",
  );
  const novas = pastasExtras.filter((p) => p.nome !== nome);
  localStorage.setItem("pastas_extras", JSON.stringify(novas));

  // Remove de fixas via lista de excluídas
  const pastasExcluidas = JSON.parse(
    localStorage.getItem("pastas_excluidas") || "[]",
  );
  if (!pastasExcluidas.includes(nome)) {
    pastasExcluidas.push(nome);
    localStorage.setItem("pastas_excluidas", JSON.stringify(pastasExcluidas));
  }

  renderizarPastas();
  mostrarAviso("Pasta excluída!");
}

function renderizarPastas() {
  const listaPastas = document.getElementById("lista-pastas");
  listaPastas.innerHTML = "";

  const pastasExcluidas = JSON.parse(localStorage.getItem("pastas_excluidas") || "[]");
  const pastasFixas = [
    { nome: "Software e Total Experience", fotos: [0], fixa: true },
    { nome: "Inglês", fotos: [1, 2], fixa: true },
  ].filter((p) => !pastasExcluidas.includes(p.nome));

  const pastasExtras = JSON.parse(localStorage.getItem("pastas_extras") || "[]");
  const todasPastas = [
    ...pastasFixas,
    ...pastasExtras.map((p) => ({ nome: p.nome, fotos: p.fotos || [], fixa: false })),
  ];

  const ordemSalva = JSON.parse(localStorage.getItem("ordem_pastas") || "[]");
  if (ordemSalva.length > 0) {
    todasPastas.sort((a, b) => {
      const ia = ordemSalva.indexOf(a.nome);
      const ib = ordemSalva.indexOf(b.nome);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }

  todasPastas.forEach((pasta) => {
    const wrapper = document.createElement("div");
    wrapper.className = "pasta-wrapper";
    wrapper.draggable = true;
    wrapper.dataset.nome = pasta.nome;

    // Long press mobile
    wrapper.addEventListener("touchstart", () => {
      longPressTimer = setTimeout(() => {
        isDragging = true;
        wrapper.style.opacity = "0.5";
        wrapper.style.border = "2px dashed #2B7FE8";
      }, 600);
    }, { passive: true });

    wrapper.addEventListener("touchend", () => {
      clearTimeout(longPressTimer);
      if (!isDragging) return;
      isDragging = false;
      wrapper.style.opacity = "";
      wrapper.style.border = "";
      salvarOrdemPastas();
    });

    wrapper.addEventListener("touchmove", (e) => {
      if (!isDragging) {
        clearTimeout(longPressTimer);
        return;
      }
      e.preventDefault();
      const touch = e.touches[0];
      const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
      const target = elements.find((el) => el.classList.contains("pasta-wrapper") && el !== wrapper);
      if (target) {
        const lista = document.getElementById("lista-pastas");
        const wrappers = [...lista.querySelectorAll(".pasta-wrapper")];
        const fromIndex = wrappers.indexOf(wrapper);
        const toIndex = wrappers.indexOf(target);
        if (fromIndex < toIndex) {
          lista.insertBefore(wrapper, target.nextSibling);
        } else {
          lista.insertBefore(wrapper, target);
        }
      }
    }, { passive: false });

    // Desktop drag and drop
    wrapper.addEventListener("dragstart", (e) => {
      dragSrc = wrapper;
      e.dataTransfer.effectAllowed = "move";
      setTimeout(() => (wrapper.style.opacity = "0.5"), 0);
    });

    wrapper.addEventListener("dragend", () => {
      wrapper.style.opacity = "";
      wrapper.style.border = "";
      dragSrc = null;
      salvarOrdemPastas();
    });

    wrapper.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (wrapper !== dragSrc) {
        wrapper.style.border = "2px dashed #2B7FE8";
      }
    });

    wrapper.addEventListener("dragleave", () => {
      wrapper.style.border = "";
    });

    wrapper.addEventListener("drop", (e) => {
      e.preventDefault();
      wrapper.style.border = "";
      if (dragSrc && dragSrc !== wrapper) {
        const lista = document.getElementById("lista-pastas");
        const wrappers = [...lista.querySelectorAll(".pasta-wrapper")];
        const fromIndex = wrappers.indexOf(dragSrc);
        const toIndex = wrappers.indexOf(wrapper);
        if (fromIndex < toIndex) {
          lista.insertBefore(dragSrc, wrapper.nextSibling);
        } else {
          lista.insertBefore(dragSrc, wrapper);
        }
      }
    });

    const div = document.createElement("div");
    div.className = "pasta";
    div.onclick = () => {
      if (!isDragging) abrirPasta(pasta.nome);
    };

    const preview = document.createElement("div");
    preview.className = "pasta-preview";
    preview.style.position = "relative";

    const pastasOverride = JSON.parse(localStorage.getItem("pastas_override") || "{}");
    const indicesFixos = pastasOverride[pasta.nome] || pasta.fotos || [];
    const pastaExtra = pastasExtras.find((p) => p.nome === pasta.nome);
    const indicesExtras = pastaExtra ? pastaExtra.fotos : [];
    const todosIndices = ordenarComOverride(
      pasta.nome,
      ordenarPorRecencia(pasta.nome, indicesFixos, indicesExtras),
    );

    if (todosIndices.length > 0) {
      todosIndices.slice(0, 2).forEach((index) => {
        if (!fotos[index]) return;
        const img = document.createElement("img");
        img.src = fotos[index].src;
        preview.appendChild(img);
      });
    } else {
      preview.style.cssText = `background:#1A1A1A; display:flex; align-items:center; justify-content:center; position:relative;`;
      preview.innerHTML = '<span class="material-icons" style="color:#444; font-size:32px;">folder_open</span>';
    }

    const btnMenu = document.createElement("button");
    btnMenu.style.cssText = `
      position: absolute;
      top: 6px;
      right: 6px;
      background: rgba(0,0,0,0.5);
      border: none;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 5;
    `;
    btnMenu.innerHTML = '<span class="material-icons" style="font-size:16px; color:#FFF;">more_vert</span>';
    btnMenu.onclick = (e) => {
      e.stopPropagation();
      abrirMenuPasta(pasta.nome, pasta.fixa, btnMenu);
    };
    preview.appendChild(btnMenu);

    const info = document.createElement("div");
    info.className = "pasta-info";
    info.innerHTML = `
      <span class="material-icons">folder</span>
      <span>${pasta.nome}</span>
    `;

    div.appendChild(preview);
    div.appendChild(info);
    wrapper.appendChild(div);
    listaPastas.appendChild(wrapper);
  });

  renderizarFotosSoltas(todasPastas, pastasExtras);
  renderizarFotosPessoal(todasPastas, pastasExtras);
  renderizarLixeira();
}

function renderizarLixeira() {
  const grid = document.getElementById("grid-lixeira");
  if (!grid) return;
  grid.innerHTML = "";

  const removidasEstudo = JSON.parse(localStorage.getItem("fotos_estudo_removidas") || "[]");
  const removidasPessoal = JSON.parse(localStorage.getItem("fotos_pessoal_removidas") || "[]");
  const indices = [...new Set([...removidasEstudo, ...removidasPessoal])];

  document.getElementById("lixeira-vazia")?.classList.toggle("oculto", indices.length > 0);

  indices.forEach((index) => {
    const foto = fotos[index];
    if (!foto) return;
    const div = document.createElement("div");
    div.className = "foto-item";
    div.style.position = "relative";
    div.innerHTML = `<img src="${foto.src}" alt="${foto.titulo}">`;

    div.appendChild(
      criarBotaoMenuFoto((btnRef) => abrirMenuFotoLixeira(index, btnRef)),
    );

    div.onclick = () => abrirFoto(index, { tipo: "lixeira" });
    grid.appendChild(div);
  });
}

function abrirMenuFotoLixeira(index, btnRef) {
  abrirMenuAcoesFoto(btnRef, [
    {
      label: "Restaurar",
      icon: "restore",
      color: "#FFF",
      action: () => restaurarFotoDaLixeira(index),
    },
  ]);
}

function restaurarFotoDaLixeira(index) {
  ["fotos_estudo_removidas", "fotos_pessoal_removidas"].forEach((chave) => {
    const lista = JSON.parse(localStorage.getItem(chave) || "[]");
    localStorage.setItem(chave, JSON.stringify(lista.filter((i) => i !== index)));
  });
  renderizarPastas();
  mostrarAviso("Foto restaurada!");
}

function abrirMenuFotoDaTelaFoto(btnRef) {
  const index = fotoAtual;
  const ctx = fotoAtualContexto;

  if (ctx?.tipo === "pasta") {
    abrirMenuFoto(ctx.pasta, index, btnRef);
  } else if (ctx?.tipo === "solta") {
    abrirMenuFotoSolta(index, btnRef);
  } else if (ctx?.tipo === "pessoal") {
    abrirMenuFotoPessoal(index, btnRef);
  } else if (ctx?.tipo === "lixeira") {
    abrirMenuFotoLixeira(index, btnRef);
  } else {
    abrirMenuAcoesFoto(btnRef, [
      {
        label: "Adicionar a pasta",
        icon: "create_new_folder",
        color: "#FFF",
        action: () => abrirSeletorPastas(index),
      },
    ]);
  }
}

const CHAVE_ORDEM_SOLTAS = "__soltas__";
const CHAVE_ORDEM_PESSOAL = "__pessoal__";

function calcularIndicesOcupados(todasPastas, pastasExtras) {
  const pastasOverride = JSON.parse(localStorage.getItem("pastas_override") || "{}");
  const indicesOcupados = new Set();
  todasPastas.forEach((pasta) => {
    const indicesFixos = pastasOverride[pasta.nome] || pasta.fotos || [];
    const pastaExtra = pastasExtras.find((p) => p.nome === pasta.nome);
    const indicesExtras = pastaExtra ? pastaExtra.fotos : [];
    [...indicesFixos, ...indicesExtras].forEach((i) => indicesOcupados.add(i));
  });
  return indicesOcupados;
}

function renderizarFotosSoltas(todasPastas, pastasExtras) {
  const gridSoltas = document.getElementById("grid-estudo-soltas");
  const tituloSoltas = document.getElementById("titulo-estudo-soltas");
  if (!gridSoltas) return;
  gridSoltas.innerHTML = "";

  const indicesOcupados = calcularIndicesOcupados(todasPastas, pastasExtras);
  const removidas = JSON.parse(localStorage.getItem("fotos_estudo_removidas") || "[]");

  const fotosSoltasBase = fotos.reduce((acc, foto, index) => {
    if (foto.tipo === "estudo" && !indicesOcupados.has(index) && !removidas.includes(index)) {
      acc.push(index);
    }
    return acc;
  }, []);

  const fotosSoltas = ordenarComOverride(CHAVE_ORDEM_SOLTAS, fotosSoltasBase);

  tituloSoltas?.classList.toggle("oculto", fotosSoltas.length === 0);

  fotosSoltas.forEach((index) => {
    const foto = fotos[index];
    const div = document.createElement("div");
    div.className = "foto-item";
    div.dataset.index = index;
    div.style.position = "relative";
    div.innerHTML = `<img src="${foto.src}" alt="${foto.titulo}">`;

    div.appendChild(
      criarBotaoMenuFoto((btnRef) => abrirMenuFotoSolta(index, btnRef)),
    );

    div.onclick = () => abrirFoto(index, { tipo: "solta" });
    gridSoltas.appendChild(div);
  });
}

function renderizarFotosPessoal(todasPastas, pastasExtras) {
  const gridPessoal = document.getElementById("grid-pessoal");
  if (!gridPessoal) return;
  gridPessoal.innerHTML = "";

  const indicesOcupados = calcularIndicesOcupados(todasPastas, pastasExtras);
  const removidas = JSON.parse(localStorage.getItem("fotos_pessoal_removidas") || "[]");

  const fotosPessoalBase = fotos.reduce((acc, foto, index) => {
    if (foto.tipo === "pessoal" && !indicesOcupados.has(index) && !removidas.includes(index)) {
      acc.push(index);
    }
    return acc;
  }, []);

  const fotosPessoal = ordenarComOverride(CHAVE_ORDEM_PESSOAL, fotosPessoalBase);

  fotosPessoal.forEach((index) => {
    const foto = fotos[index];
    const div = document.createElement("div");
    div.className = "foto-item";
    div.dataset.index = index;
    div.style.position = "relative";
    div.innerHTML = `<img src="${foto.src}" alt="${foto.titulo}">`;

    div.appendChild(
      criarBotaoMenuFoto((btnRef) => abrirMenuFotoPessoal(index, btnRef)),
    );

    div.onclick = () => abrirFoto(index, { tipo: "pessoal" });
    gridPessoal.appendChild(div);
  });
}

function abrirMenuFotoSolta(index, btnRef) {
  abrirMenuAcoesFoto(btnRef, [
    {
      label: "Mover para cima",
      icon: "arrow_upward",
      color: "#FFF",
      action: () => moverFotoSolta(index, "cima"),
    },
    {
      label: "Mover para baixo",
      icon: "arrow_downward",
      color: "#FFF",
      action: () => moverFotoSolta(index, "baixo"),
    },
    {
      label: "Adicionar a pasta",
      icon: "create_new_folder",
      color: "#FFF",
      action: () => abrirSeletorPastas(index),
    },
    {
      label: "Remover",
      icon: "delete",
      color: "#E84545",
      action: () => removerFotoSolta(index),
    },
  ]);
}

function abrirMenuFotoPessoal(index, btnRef) {
  abrirMenuAcoesFoto(btnRef, [
    {
      label: "Mover para cima",
      icon: "arrow_upward",
      color: "#FFF",
      action: () => moverFotoPessoal(index, "cima"),
    },
    {
      label: "Mover para baixo",
      icon: "arrow_downward",
      color: "#FFF",
      action: () => moverFotoPessoal(index, "baixo"),
    },
    {
      label: "Adicionar a pasta",
      icon: "create_new_folder",
      color: "#FFF",
      action: () => abrirSeletorPastas(index),
    },
    {
      label: "Remover",
      icon: "delete",
      color: "#E84545",
      action: () => removerFotoPessoal(index),
    },
  ]);
}

function moverFotoEmGrid(gridId, chaveOrdem, index, direcao) {
  const grid = document.getElementById(gridId);
  const ordemAtual = [...grid.querySelectorAll(".foto-item")].map((item) =>
    Number(item.dataset.index),
  );
  const posicao = ordemAtual.indexOf(index);
  const novaPosicao = direcao === "cima" ? posicao - 1 : posicao + 1;
  if (novaPosicao < 0 || novaPosicao >= ordemAtual.length) return;

  [ordemAtual[posicao], ordemAtual[novaPosicao]] = [
    ordemAtual[novaPosicao],
    ordemAtual[posicao],
  ];

  const ordensFotos = JSON.parse(localStorage.getItem("ordem_fotos_pastas") || "{}");
  ordensFotos[chaveOrdem] = ordemAtual;
  localStorage.setItem("ordem_fotos_pastas", JSON.stringify(ordensFotos));

  renderizarPastas();
}

function removerFotoComChave(chaveLocalStorage, index) {
  const removidas = JSON.parse(localStorage.getItem(chaveLocalStorage) || "[]");
  if (!removidas.includes(index)) {
    removidas.push(index);
    localStorage.setItem(chaveLocalStorage, JSON.stringify(removidas));
  }
  renderizarPastas();
  mostrarAviso("Foto removida!");
}

function moverFotoSolta(index, direcao) {
  moverFotoEmGrid("grid-estudo-soltas", CHAVE_ORDEM_SOLTAS, index, direcao);
}

function removerFotoSolta(index) {
  removerFotoComChave("fotos_estudo_removidas", index);
}

function moverFotoPessoal(index, direcao) {
  moverFotoEmGrid("grid-pessoal", CHAVE_ORDEM_PESSOAL, index, direcao);
}

function removerFotoPessoal(index) {
  removerFotoComChave("fotos_pessoal_removidas", index);
}

function abrirSeletorPastas(indexFoto) {
  const celular = document.querySelector(".celular");

  const overlay = document.createElement("div");
  overlay.id = "overlay-seletor-pastas";
  overlay.style.cssText = `
    position: absolute;
    bottom: 0; left: 0;
    width: 100%; height: 70%;
    background: #1A1A1A;
    border-radius: 16px 16px 0 0;
    z-index: 30;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;

  const header = document.createElement("div");
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #2B2B2B;
  `;
  header.innerHTML = `
    <p style="color:#FFF; font-size:14px; font-weight:600; margin:0;">Mover para pasta</p>
    <button onclick="document.getElementById('overlay-seletor-pastas').remove()"
      style="background:transparent; border:none; color:#FFF; cursor:pointer;">
      <span class="material-icons">close</span>
    </button>
  `;

  const lista = document.createElement("div");
  lista.style.cssText = `
    overflow-y: auto;
    flex: 1;
    padding: 8px;
  `;

  const pastasExcluidas = JSON.parse(localStorage.getItem("pastas_excluidas") || "[]");
  const pastasFixas = [
    { nome: "Software e Total Experience", fixa: true },
    { nome: "Inglês", fixa: true },
  ].filter((p) => !pastasExcluidas.includes(p.nome));
  const pastasExtras = JSON.parse(localStorage.getItem("pastas_extras") || "[]");
  const todasPastas = [...pastasFixas, ...pastasExtras];

  if (todasPastas.length === 0) {
    lista.innerHTML = `<p style="color:#888; font-size:13px; padding:12px;">Nenhuma pasta criada ainda.</p>`;
  }

  todasPastas.forEach((pasta) => {
    const item = document.createElement("button");
    item.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      background: transparent;
      border: none;
      border-bottom: 1px solid #2B2B2B;
      padding: 14px 12px;
      color: #FFF;
      font-size: 13px;
      cursor: pointer;
      text-align: left;
    `;
    item.innerHTML = `<span class="material-icons" style="font-size:18px; color:#888;">folder</span>${pasta.nome}`;
    item.onclick = () => adicionarFotoNaPasta(pasta.nome, indexFoto, overlay);
    lista.appendChild(item);
  });

  overlay.appendChild(header);
  overlay.appendChild(lista);
  celular.appendChild(overlay);
}

function abrirMenuPasta(nome, fixa, btnRef) {
  console.log("abrirMenuPasta", nome, fixa);
  document.getElementById("menu-pasta")?.remove();

  const menu = document.createElement("div");
  menu.id = "menu-pasta";
  menu.style.cssText = `
    position: absolute;
    background: #1A1A1A;
    border: 1px solid #2B2B2B;
    border-radius: 10px;
    padding: 4px 0;
    z-index: 100;
    min-width: 150px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
  `;

  const celularRect = document
    .querySelector(".celular")
    .getBoundingClientRect();
  const btnRect = btnRef.getBoundingClientRect();
  menu.style.top = btnRect.bottom - celularRect.top + 4 + "px";
  menu.style.right = celularRect.right - btnRect.right + "px";
const opcoes = [
  { label: 'Renomear', icon: 'edit', color: '#FFF', action: () => renomearPasta(nome) },
];

if (!fixa) {
  opcoes.push({ 
    label: 'Excluir', 
    icon: 'delete', 
    color: '#E84545', 
    action: () => excluirPasta(nome) 
  });
}

  opcoes.forEach((op) => {
    const btn = document.createElement("button");
    btn.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      background: transparent;
      border: none;
      padding: 10px 14px;
      color: ${op.color};
      font-size: 13px;
      cursor: pointer;
      text-align: left;
    `;
    btn.innerHTML = `<span class="material-icons" style="font-size:16px; color:${op.color};">${op.icon}</span>${op.label}`;
    btn.onclick = () => {
      menu.remove();
      op.action();
    };
    menu.appendChild(btn);
  });

  document.querySelector(".celular").appendChild(menu);

  setTimeout(() => {
    document.addEventListener("click", () => menu.remove(), { once: true });
  }, 0);
}

function renomearPasta(nome) {
  const celular = document.querySelector(".celular");
  celular.style.position = "relative";

  const overlay = document.createElement("div");
  overlay.id = "overlay-renomear";
  overlay.style.cssText = `
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.7);
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  const modal = document.createElement("div");
  modal.style.cssText = `
    background: #1A1A1A;
    border-radius: 16px;
    padding: 20px;
    width: 80%;
    display: flex;
    flex-direction: column;
    gap: 12px;
    border: 1px solid #2B2B2B;
  `;

  const titulo = document.createElement("p");
  titulo.textContent = "Renomear pasta";
  titulo.style.cssText = `color: #FFF; font-size: 14px; font-weight: 600; margin: 0;`;

  const input = document.createElement("input");
  input.type = "text";
  input.value = nome;
  input.style.cssText = `
    background: #2B2B2B;
    border: 1px solid #333;
    border-radius: 10px;
    padding: 10px 14px;
    color: #FFF;
    font-size: 13px;
    outline: none;
  `;

  const botoes = document.createElement("div");
  botoes.style.cssText = `display: flex; gap: 8px; justify-content: flex-end;`;

  const btnCancelar = document.createElement("button");
  btnCancelar.textContent = "Cancelar";
  btnCancelar.style.cssText = `
    background: transparent;
    border: 1px solid #333;
    border-radius: 10px;
    color: #888;
    padding: 8px 16px;
    font-size: 13px;
    cursor: pointer;
  `;
  btnCancelar.onclick = () => overlay.remove();

  const btnConfirmar = document.createElement("button");
  btnConfirmar.textContent = "Salvar";
  btnConfirmar.style.cssText = `
    background: #2B7FE8;
    border: none;
    border-radius: 10px;
    color: #FFF;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  `;
  btnConfirmar.onclick = () => {
    const novoNome = input.value.trim();
    if (!novoNome || novoNome === nome) {
      overlay.remove();
      return;
    }

    const pastasExtras = JSON.parse(
      localStorage.getItem("pastas_extras") || "[]",
    );
    const pastaIndex = pastasExtras.findIndex((p) => p.nome === nome);
    if (pastaIndex !== -1) {
      pastasExtras[pastaIndex].nome = novoNome;
      localStorage.setItem("pastas_extras", JSON.stringify(pastasExtras));
    }

    overlay.remove();
    renderizarPastas();
    mostrarAviso("Pasta renomeada!");
  };

  botoes.appendChild(btnCancelar);
  botoes.appendChild(btnConfirmar);
  modal.appendChild(titulo);
  modal.appendChild(input);
  modal.appendChild(botoes);
  overlay.appendChild(modal);
  celular.appendChild(overlay);

  setTimeout(() => input.focus(), 100);
}

function mostrarAviso(texto) {
  const avisoExistente = document.getElementById("aviso-galeria");
  avisoExistente?.remove();

  const aviso = document.createElement("div");
  aviso.id = "aviso-galeria";
  aviso.textContent = texto;
  aviso.style.cssText = `
    position: absolute;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.8);
    color: #FFF;
    padding: 8px 20px;
    border-radius: 20px;
    font-size: 13px;
    z-index: 50;
    white-space: nowrap;
  `;
  document.querySelector('.celular').appendChild(aviso);
  setTimeout(() => aviso.remove(), 2000);
}

function salvarOrdemPastas() {
  const lista = document.getElementById('lista-pastas');
  const wrappers = [...lista.querySelectorAll('.pasta-wrapper')];
  const ordem = wrappers.map(w => w.dataset.nome);
  localStorage.setItem('ordem_pastas', JSON.stringify(ordem));
}