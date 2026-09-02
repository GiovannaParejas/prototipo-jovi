const fotos = [
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

function abrirPasta(nome) {
  pastaAtual = nome;
  document.getElementById("pasta-titulo").textContent = nome;
  const grid = document.getElementById("pasta-fotos");
  grid.innerHTML = "";

  pastas[nome].forEach((index) => {
    const foto = fotos[index];
    const div = document.createElement("div");
    div.className = "foto-item";
    div.style.aspectRatio = "1";
    div.style.overflow = "hidden";
    div.style.borderRadius = "8px";
    div.onclick = () => abrirFotoDaPasta(index);
    div.innerHTML = `<img src="${foto.src}" alt="${foto.titulo}" style="width:100%;height:100%;object-fit:cover;">`;
    grid.appendChild(div);
  });

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
        const btnEsq = document.getElementById('btn-esquerda');
        if (!btnEsq) return;
        if (index === 1) {
            btnEsq.innerHTML = '<span class="material-icons">translate</span><span>Traduzir</span>';
            btnEsq.onclick = () => abrirFoto(2);
        } else if (index === 2) {
            btnEsq.innerHTML = '<span class="material-icons">arrow_back</span><span>Voltar</span>';
            btnEsq.onclick = () => abrirFoto(1);
        }
    }, 0);
}