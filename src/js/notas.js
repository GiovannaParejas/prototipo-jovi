const notasFixas = [
  {
    titulo: "Holiday at Sea",
    corpo:
      "My wife and I had never considered a cruise holiday because we have four children under fourteen and we didn't think a ship could offer the kind of facilities that kids enjoy. But we found we were wrong when we took a 9-day trip on the Caribbean Princess, a ship which can carry over three thousand passengers.||We travelled last August, and so the ship was nearly full although more people go in July. We boarded the boat in Florida and our destinations were the Bahamas, Jamaica, the Cayman Islands and Mexico, which are all beautiful places to visit.||On board, my children had special clubs to go to so they always had plenty to do with people of their own age, while my wife and I could relax knowing professionals were keeping an eye on them. The on-board facilities were fantastic, including great shops, a jogging track, basketball courts and a range of excellent restaurants.||I wanted to find out what was involved in running such a big ship so I went through doors I wasn't really supposed to open!||I would definitely recommend a cruise holiday to anyone but make sure you search for the best possible price.||You'll want to keep in touch with people back home while you are away but remember that most mobile phones don't work at sea.||Unless you run into unusually bad weather, it is unlikely you'll be seasick.",
    tag: "Estudo",
    tagcor: "azul",
    data: "Hoje, 09:12",
  },
  {
    titulo: "Férias no Mar (Tradução)",
    corpo:
      "Minha esposa e eu nunca tínhamos considerado fazer um cruzeiro, porque temos quatro filhos com menos de quatorze anos e achávamos que um navio não poderia oferecer o tipo de instalações que as crianças gostam. Mas descobrimos que estávamos errados quando fizemos uma viagem de 9 dias no Caribbean Princess.||A bordo, meus filhos tinham clubes especiais para frequentar, então sempre tinham bastante coisa para fazer com pessoas da mesma idade, enquanto minha esposa e eu podíamos relaxar sabendo que profissionais estavam cuidando deles.||Eu queria descobrir o que estava envolvido em operar um navio tão grande, então passei por portas que não deveria abrir!||Eu recomendaria definitivamente um cruzeiro a qualquer pessoa, mas certifique-se de procurar o melhor preço possível.||Você vai querer manter contato com as pessoas em casa enquanto estiver viajando, mas lembre-se de que a maioria dos celulares não funciona no mar.||A menos que você enfrente um clima incomumente ruim, é pouco provável que você fique enjoado.",
    tag: "Pessoal",
    tagcor: "verde",
    data: "Ontem, 21:45",
  },
  {
    titulo: "Design Thinking - Process (Texto)",
    corpo:
      "Nano Course - Design como ferramenta de inovação.||O que é design centrado no usuário? É a utilização da investigação e pesquisa para descobrir e compreender os problemas das pessoas que utilizam o serviço, explorando e compreendendo seu comportamento, necessidades, desejos, sonhos e desejos.||O que é inovação? Processo criativo e transformador que promove a ruptura de paradigmas, o mesmo que qual, impactando positivamente na qualidade de vida e no desenvolvimento humano.||Tipos de inovação: Incremental - pequenas melhorias ou atualizações. Disruptiva - uma tecnologia que é transformada ou substituída por uma inovação de qualidade superior.||E como inovar? Ela precisa ser desejada pelas pessoas. Precisa ser rentável e factível do ponto de vista do negócio. Precisa ser tecnicamente possível.",
    tag: "Rascunho",
    tagcor: "amarelo",
    data: "03/05, 14:30",
  },
  {
    titulo: "Fórmula de Bhaskara",
    corpo:
      "Equações do 2º grau — ax² + bx + c = 0" +
      "||A fórmula de Bhaskara resolve qualquer equação do segundo grau, encontrando os valores de x a partir dos coeficientes a, b e c." +
      "||Fórmula principal:" +
      '||<span style="display:inline-flex; flex-direction:column; align-items:center; vertical-align:middle; font-size:14px; margin:4px 0;"><span style="border-bottom:1px solid currentColor; padding:0 4px;">-b ± √Δ</span><span style="padding:0 4px;">2a</span></span>' +
      "||Onde o discriminante Δ (delta) é calculado por:" +
      '||<span style="display:inline-flex; flex-direction:column; align-items:center; vertical-align:middle; font-size:14px; margin:4px 0;"><span style="padding:0 4px;">Δ = b² - 4ac</span></span>' +
      "||Interpretação do Δ:" +
      "||• Δ > 0 → duas raízes reais e distintas" +
      "||• Δ = 0 → raiz dupla (duas iguais)" +
      "||• Δ < 0 → nenhuma raiz real" +
      "||Exemplo prático: x² - 5x + 6 = 0" +
      "||a = 1, b = -5, c = 6" +
      "||Δ = (-5)² - 4·1·6 = 25 - 24 = 1" +
      '||<span style="display:inline-flex; flex-direction:column; align-items:center; vertical-align:middle; font-size:14px; margin:4px 0;"><span style="border-bottom:1px solid currentColor; padding:0 4px;">5 ± √1</span><span style="padding:0 4px;">2</span></span>' +
      "||x₁ = 3   |   x₂ = 2",
    tag: "Estudo",
    tagcor: "azul",
    data: "Hoje, 10:45",
  },
];

const MAPA_TIPO_NOTA = {
  estudo: { tag: "Estudo", tagcor: "azul" },
  pessoal: { tag: "Pessoal", tagcor: "verde" },
  rascunho: { tag: "Rascunho", tagcor: "amarelo" },
};

function formatarDataAtual() {
  const agora = new Date();
  const hora = String(agora.getHours()).padStart(2, "0");
  const minuto = String(agora.getMinutes()).padStart(2, "0");
  return `Hoje, ${hora}:${minuto}`;
}

function abrirNotaNoEditor(nota) {
  sessionStorage.setItem("nota_titulo", nota.titulo);
  sessionStorage.setItem("nota_corpo", nota.corpo);
  window.location.href = "nota-editor.html";
}

function renderizarNotas() {
  const lista = document.getElementById("lista-notas");
  if (!lista) return;
  lista.innerHTML = "";

  const notasExtras = JSON.parse(localStorage.getItem("notas_extras") || "[]");
  const todasNotas = [...notasExtras, ...notasFixas];

  const contador = document.getElementById("contador-notas");
  if (contador) {
    contador.textContent = `${todasNotas.length} nota${todasNotas.length === 1 ? "" : "s"}`;
  }

  todasNotas.forEach((nota) => {
    const card = document.createElement("a");
    card.className = `nota-card ${nota.tagcor}`;
    card.style.cursor = "pointer";
    card.onclick = (e) => {
      e.preventDefault();
      abrirNotaNoEditor(nota);
    };

    const preview = nota.corpo
      .split("||")
      .join(" ")
      .replace(/<[^>]+>/g, "");

    card.innerHTML = `
      <div class="nota-titulo">${nota.titulo}</div>
      <div class="nota-preview">${preview}</div>
      <div class="nota-meta">
        <span class="nota-data">${nota.data}</span>
        <span class="nota-tag ${nota.tagcor}">${nota.tag}</span>
      </div>
    `;

    lista.appendChild(card);
  });
}

function abrirCriarNota() {
  const celular = document.querySelector(".celular");
  celular.style.position = "relative";

  const overlay = document.createElement("div");
  overlay.id = "overlay-nova-nota";
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
    width: 85%;
    max-height: 80%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    border: 1px solid #2A2A2A;
  `;

  const titulo = document.createElement("p");
  titulo.textContent = "Nova nota";
  titulo.style.cssText = `color:#FFF; font-size:14px; font-weight:600; margin:0;`;

  const inputTitulo = document.createElement("input");
  inputTitulo.type = "text";
  inputTitulo.placeholder = "Título da nota";
  inputTitulo.style.cssText = `
    background:#141414; border:1px solid #2A2A2A; border-radius:10px;
    padding:10px 14px; color:#FFF; font-size:13px; outline:none;
  `;

  const textareaCorpo = document.createElement("textarea");
  textareaCorpo.placeholder = "Escreva o conteúdo da nota...";
  textareaCorpo.rows = 5;
  textareaCorpo.style.cssText = `
    background:#141414; border:1px solid #2A2A2A; border-radius:10px;
    padding:10px 14px; color:#FFF; font-size:13px; outline:none;
    resize:vertical; font-family:inherit;
  `;

  const labelTipo = document.createElement("p");
  labelTipo.textContent = "Tipo";
  labelTipo.style.cssText = `color:#AAA; font-size:12px; margin:0;`;

  const selectTipo = document.createElement("select");
  selectTipo.style.cssText = `
    background:#141414; border:1px solid #2A2A2A; border-radius:10px;
    padding:10px 14px; color:#FFF; font-size:13px; outline:none;
  `;
  [
    { label: "Rascunho", value: "rascunho" },
    { label: "Estudo", value: "estudo" },
    { label: "Pessoal", value: "pessoal" },
  ].forEach((op) => {
    const option = document.createElement("option");
    option.value = op.value;
    option.textContent = op.label;
    selectTipo.appendChild(option);
  });
  selectTipo.value = "rascunho";

  const botoes = document.createElement("div");
  botoes.style.cssText = `display:flex; gap:8px; justify-content:flex-end;`;

  const btnCancelar = document.createElement("button");
  btnCancelar.textContent = "Cancelar";
  btnCancelar.style.cssText = `
    background:transparent; border:1px solid #2A2A2A; border-radius:10px;
    color:#666; padding:8px 16px; font-size:13px; cursor:pointer;
  `;
  btnCancelar.onclick = () => overlay.remove();

  const btnCriar = document.createElement("button");
  btnCriar.textContent = "Criar";
  btnCriar.style.cssText = `
    background:#415FFF; border:none; border-radius:10px;
    color:#FFF; padding:8px 16px; font-size:13px; font-weight:600; cursor:pointer;
  `;
  btnCriar.onclick = () => {
    const tituloDigitado = inputTitulo.value.trim();
    if (!tituloDigitado) return;

    const tipoSelecionado = selectTipo.value || "rascunho";
    const { tag, tagcor } = MAPA_TIPO_NOTA[tipoSelecionado];

    const notasExtras = JSON.parse(localStorage.getItem("notas_extras") || "[]");
    notasExtras.unshift({
      titulo: tituloDigitado,
      corpo: textareaCorpo.value.trim() || "Nota vazia.",
      tag,
      tagcor,
      data: formatarDataAtual(),
    });
    localStorage.setItem("notas_extras", JSON.stringify(notasExtras));

    overlay.remove();
    renderizarNotas();
  };

  botoes.appendChild(btnCancelar);
  botoes.appendChild(btnCriar);

  modal.appendChild(titulo);
  modal.appendChild(inputTitulo);
  modal.appendChild(textareaCorpo);
  modal.appendChild(labelTipo);
  modal.appendChild(selectTipo);
  modal.appendChild(botoes);
  overlay.appendChild(modal);
  celular.appendChild(overlay);

  setTimeout(() => inputTitulo.focus(), 100);
}

document.querySelector(".btn-nova-nota").onclick = abrirCriarNota;

renderizarNotas();
