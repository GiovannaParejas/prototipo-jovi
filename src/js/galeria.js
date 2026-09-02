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
  const gridPessoal = document.getElementById("grid-pessoal");
  if (!gridPessoal) return;

  const fotosExtrasAtualizadas = JSON.parse(
    localStorage.getItem("fotos_extras") || "[]",
  );
  const todasFotos = [...fotosFixas, ...fotosExtrasAtualizadas];

  fotos.length = 0;
  todasFotos.forEach((f) => fotos.push(f));

  todasFotos
    .filter((f) => f.tipo === "pessoal")
    .forEach((foto) => {
      const index = todasFotos.indexOf(foto);
      const div = document.createElement("div");
      div.className = "foto-item";
      div.onclick = () => abrirFoto(index);
      div.innerHTML = `<img src="${foto.src}" alt="${foto.titulo}">`;
      gridPessoal.appendChild(div);
    });

  renderizarPastas();
}, 0);
let fotoAtual = null;

const notaUrls = [
  "nota-editor.html?titulo=Holiday at Sea&tag=Estudo&tagcor=azul&corpo=My wife and I had never considered a cruise holiday...",
  "nota-editor.html?titulo=Férias no Mar&tag=Pessoal&tagcor=verde&corpo=Minha esposa e eu nunca tínhamos considerado...",
  "nota-editor.html?titulo=Design Thinking - Process&tag=Rascunho&tagcor=amarelo&corpo=Nano Course – Design como ferramenta de inovação...",
];

const params = new URLSearchParams(window.location.search);
const fotoParam = params.get("foto");
if (fotoParam !== null) abrirFoto(parseInt(fotoParam));

function abrirFoto(index) {
  fotoAtual = index;
  const foto = fotos[index];
  document.getElementById("foto-ampliada").src = foto.src;
  document.getElementById("foto-titulo").textContent = foto.titulo;
  document.getElementById("tela-galeria").classList.add("oculto");
  document.getElementById("tela-foto").classList.remove("oculto");
  fecharMenuAnotacoes();
  fecharGrifar();
  fecharPDF();

  const acoes = document.querySelector(".foto-acoes");

  if (foto.tipo === "pessoal") {
    acoes.innerHTML = `
      <button class="acao-btn">
        <span class="material-icons">share</span>
        <span>Compartilhar</span>
      </button>
      <button class="acao-btn">
        <span class="material-icons">edit</span>
        <span>Editar</span>
      </button>
    `;
  } else {
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
      <button class="acao-btn">
        <span class="material-icons">edit</span>
        <span>Editar</span>
      </button>
    `;
    aplicarBtnEsquerda(index);
  }
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

function abrirNota() {
  const foto = fotos[fotoAtual];
  const notaCompleta = notasCompletas[foto.nota];
  sessionStorage.setItem("nota_titulo", notaCompleta.titulo);
  sessionStorage.setItem("nota_corpo", notaCompleta.corpo);
  window.location.href = "nota-editor.html";
}

const notasCompletas = [
  {
    titulo: "Holiday at Sea",
    corpo:
      "My wife and I had never considered a cruise holiday because we have four children under fourteen and we didn't think a ship could offer the kind of facilities that kids enjoy. But we found we were wrong when we took a 9-day trip on the Caribbean Princess, a ship which can carry over three thousand passengers.||We travelled last August, and so the ship was nearly full although more people go in July. We boarded the boat in Florida and our destinations were the Bahamas, Jamaica, the Cayman Islands and Mexico, which are all beautiful places to visit.||On board, my children had special clubs to go to so they always had plenty to do with people of their own age, while my wife and I could relax knowing professionals were keeping an eye on them. The on-board facilities were fantastic, including great shops, a jogging track, basketball courts and a range of excellent restaurants.||I wanted to find out what was involved in running such a big ship so I went through doors I wasn't really supposed to open!||I would definitely recommend a cruise holiday to anyone but make sure you search for the best possible price.||You'll want to keep in touch with people back home while you are away but remember that most mobile phones don't work at sea.||Unless you run into unusually bad weather, it is unlikely you'll be seasick.",
  },
  {
    titulo: "Férias no Mar (Tradução)",
    corpo:
      "Minha esposa e eu nunca tínhamos considerado fazer um cruzeiro, porque temos quatro filhos com menos de quatorze anos e achávamos que um navio não poderia oferecer o tipo de instalações que as crianças gostam. Mas descobrimos que estávamos errados quando fizemos uma viagem de 9 dias no Caribbean Princess.||A bordo, meus filhos tinham clubes especiais para frequentar, então sempre tinham bastante coisa para fazer com pessoas da mesma idade, enquanto minha esposa e eu podíamos relaxar sabendo que profissionais estavam cuidando deles.||Eu queria descobrir o que estava envolvido em operar um navio tão grande, então passei por portas que não deveria abrir!||Eu recomendaria definitivamente um cruzeiro a qualquer pessoa, mas certifique-se de procurar o melhor preço possível.||Você vai querer manter contato com as pessoas em casa enquanto estiver viajando, mas lembre-se de que a maioria dos celulares não funciona no mar.||A menos que você enfrente um clima incomumente ruim, é pouco provável que você fique enjoado.",
  },
  {
    titulo: "Design Thinking - Process",
    corpo:
      "Nano Course - Design como ferramenta de inovação.||O que é design centrado no usuário? É a utilização da investigação e pesquisa para descobrir e compreender os problemas das pessoas que utilizam o serviço, explorando e compreendendo seu comportamento, necessidades, desejos, sonhos e desejos.||O que é inovação? Processo criativo e transformador que promove a ruptura de paradigmas, o mesmo que qual, impactando positivamente na qualidade de vida e no desenvolvimento humano.||Tipos de inovação: Incremental - pequenas melhorias ou atualizações. Disruptiva - uma tecnologia que é transformada ou substituída por uma inovação de qualidade superior.||E como inovar? Ela precisa ser desejada pelas pessoas. Precisa ser rentável e factível do ponto de vista do negócio. Precisa ser tecnicamente possível.",
  },
];

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

function abrirVisualizadorPDF(tipo) {
  fecharPDF();
  document.getElementById("tela-foto").classList.add("oculto");
  document.getElementById("tela-pdf").classList.remove("oculto");
  document.getElementById("pdf-titulo").textContent =
    tipo === "texto" ? "Texto em PDF" : "Foto em PDF";

  const pdfPorFoto = {
    0: {
      foto: "../assets/DesignCadernoPDF.png",
      texto: "../assets/designTextoPDF.png",
    },
    1: {
      foto: "../assets/HolidayCadernoPDF.png",
      texto: "../assets/holidayTextoPDF.png",
    },
    2: {
      foto: "../assets/FeriasCadernoPDF.png",
      texto: "../assets/FeriasTextoPDF.png",
    },
  };

  const imagens = pdfPorFoto[fotoAtual];
  document.getElementById("pdf-p1").src =
    tipo === "foto" ? imagens.foto : imagens.texto;
}

function fecharVisualizadorPDF() {
  document.getElementById("tela-pdf").classList.add("oculto");
  document.getElementById("tela-foto").classList.remove("oculto");
}

function abrirResumo() {
  window.location.href = `ia.html?foto=${fotoAtual}`;
}

function trocarTab(modo, el) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("ativo"));
  el.classList.add("ativo");

  if (modo === "estudo") {
    document.getElementById("view-estudo").classList.remove("oculto");
    document.getElementById("view-pessoal").classList.add("oculto");
  } else {
    document.getElementById("view-pessoal").classList.remove("oculto");
    document.getElementById("view-estudo").classList.add("oculto");
  }
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
      aspect-ratio: 1;
      overflow: hidden;
      cursor: pointer;
      position: relative;
    `;
    div.innerHTML = `<img src="${foto.src}" style="width:100%; height:100%; object-fit:cover;">`;
    div.onclick = () => adicionarFotoNaPasta(nomePasta, index, overlay);
    grid.appendChild(div);
  });

  overlay.appendChild(header);
  overlay.appendChild(grid);
  celular.appendChild(overlay);
}

function adicionarFotoNaPasta(nomePasta, index, overlay) {
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

  overlay.remove();
  renderizarPastas();        // ← atualiza o preview
  abrirPasta(nomePasta);     // ← reabre a pasta com a nova foto
  mostrarAviso('Foto adicionada!');
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
  const todosIndices = [...new Set([...indicesFixos, ...indicesExtras])];

  todosIndices.forEach((index) => {
    const foto = fotos[index];
    if (!foto) return;
    const div = document.createElement("div");
    div.className = "foto-item";
    div.style.aspectRatio = "1";
    div.style.overflow = "hidden";
    div.style.borderRadius = "8px";
    div.onclick = () => abrirFotoDaPasta(index);
    div.innerHTML = `<img src="${foto.src}" alt="${foto.titulo}" style="width:100%;height:100%;object-fit:cover;">`;
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

function abrirFotoDaPasta(index) {
  fotoAtual = index;
  const foto = fotos[index];
  document.getElementById("foto-ampliada").src = foto.src;
  document.getElementById("foto-titulo").textContent = foto.titulo;
  document.getElementById("tela-pasta").classList.add("oculto");
  document.getElementById("tela-foto").classList.remove("oculto");
  fecharMenuAnotacoes();
  fecharGrifar();
  fecharPDF();

  const acoes = document.querySelector(".foto-acoes");

  if (foto.tipo === "pessoal") {
    acoes.innerHTML = `
      <button class="acao-btn">
        <span class="material-icons">share</span>
        <span>Compartilhar</span>
      </button>
      <button class="acao-btn">
        <span class="material-icons">edit</span>
        <span>Editar</span>
      </button>
    `;
  } else {
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
      <button class="acao-btn">
        <span class="material-icons">edit</span>
        <span>Editar</span>
      </button>
    `;
    aplicarBtnEsquerda(index);
  }
}

function fecharPasta() {
  document.getElementById("tela-pasta").classList.add("oculto");
  document.getElementById("tela-galeria").classList.remove("oculto");
}

function aplicarBtnEsquerda(index) {
  setTimeout(() => {
    const btnEsq = document.getElementById("btn-esquerda");
    if (!btnEsq) return;
    if (index === 1) {
      btnEsq.innerHTML =
        '<span class="material-icons">translate</span><span>Traduzir</span>';
      btnEsq.onclick = () => abrirFoto(2);
    } else if (index === 2) {
      btnEsq.innerHTML =
        '<span class="material-icons">arrow_back</span><span>Voltar</span>';
      btnEsq.onclick = () => abrirFoto(1);
    }
  }, 0);
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
    const todosIndices = [...new Set([...indicesFixos, ...indicesExtras])];

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