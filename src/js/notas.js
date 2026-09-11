const notasFixas = [
  {
    id: "fixa-0",
    titulo: "Holiday at Sea",
    corpo:
      "My wife and I had never considered a cruise holiday because we have four children under fourteen and we didn't think a ship could offer the kind of facilities that kids enjoy. But we found we were wrong when we took a 9-day trip on the Caribbean Princess, a ship which can carry over three thousand passengers.||We travelled last August, and so the ship was nearly full although more people go in July. We boarded the boat in Florida and our destinations were the Bahamas, Jamaica, the Cayman Islands and Mexico, which are all beautiful places to visit.||On board, my children had special clubs to go to so they always had plenty to do with people of their own age, while my wife and I could relax knowing professionals were keeping an eye on them. The on-board facilities were fantastic, including great shops, a jogging track, basketball courts and a range of excellent restaurants.||I wanted to find out what was involved in running such a big ship so I went through doors I wasn't really supposed to open!||I would definitely recommend a cruise holiday to anyone but make sure you search for the best possible price.||You'll want to keep in touch with people back home while you are away but remember that most mobile phones don't work at sea.||Unless you run into unusually bad weather, it is unlikely you'll be seasick.",
    tag: "Estudo",
    tagcor: "azul",
    data: "Hoje, 09:12",
  },
  {
    id: "fixa-1",
    titulo: "Férias no Mar (Tradução)",
    corpo:
      "Minha esposa e eu nunca tínhamos considerado fazer um cruzeiro, porque temos quatro filhos com menos de quatorze anos e achávamos que um navio não poderia oferecer o tipo de instalações que as crianças gostam. Mas descobrimos que estávamos errados quando fizemos uma viagem de 9 dias no Caribbean Princess.||A bordo, meus filhos tinham clubes especiais para frequentar, então sempre tinham bastante coisa para fazer com pessoas da mesma idade, enquanto minha esposa e eu podíamos relaxar sabendo que profissionais estavam cuidando deles.||Eu queria descobrir o que estava envolvido em operar um navio tão grande, então passei por portas que não deveria abrir!||Eu recomendaria definitivamente um cruzeiro a qualquer pessoa, mas certifique-se de procurar o melhor preço possível.||Você vai querer manter contato com as pessoas em casa enquanto estiver viajando, mas lembre-se de que a maioria dos celulares não funciona no mar.||A menos que você enfrente um clima incomumente ruim, é pouco provável que você fique enjoado.",
    tag: "Pessoal",
    tagcor: "verde",
    data: "Ontem, 21:45",
  },
  {
    id: "fixa-2",
    titulo: "Design Thinking - Process (Texto)",
    corpo:
      "Nano Course - Design como ferramenta de inovação.||O que é design centrado no usuário? É a utilização da investigação e pesquisa para descobrir e compreender os problemas das pessoas que utilizam o serviço, explorando e compreendendo seu comportamento, necessidades, desejos, sonhos e desejos.||O que é inovação? Processo criativo e transformador que promove a ruptura de paradigmas, o mesmo que qual, impactando positivamente na qualidade de vida e no desenvolvimento humano.||Tipos de inovação: Incremental - pequenas melhorias ou atualizações. Disruptiva - uma tecnologia que é transformada ou substituída por uma inovação de qualidade superior.||E como inovar? Ela precisa ser desejada pelas pessoas. Precisa ser rentável e factível do ponto de vista do negócio. Precisa ser tecnicamente possível.",
    tag: "Rascunho",
    tagcor: "amarelo",
    data: "03/05, 14:30",
  },
  {
    id: "fixa-3",
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

const CHAVE_SOLTAS_ESTUDO = "__soltas_estudo__";
let pastaNotaAtual = null;

// --- Pastas de notas ---

function obterPastasNotas() {
  return JSON.parse(localStorage.getItem("notas_pastas") || "[]");
}

function salvarPastasNotas(pastas) {
  localStorage.setItem("notas_pastas", JSON.stringify(pastas));
}

function criarPastaNotaObj(nome) {
  const pastas = obterPastasNotas();
  pastas.push({ id: `pasta-${Date.now()}`, nome });
  salvarPastasNotas(pastas);
}

function renomearPastaNotaObj(id, novoNome) {
  const pastas = obterPastasNotas();
  const pasta = pastas.find((p) => p.id === id);
  if (pasta) pasta.nome = novoNome;
  salvarPastasNotas(pastas);
}

function excluirPastaNotaObj(id) {
  const todasNotas = [...obterNotasExtras(), ...obterNotasFixasComOverrides()];
  todasNotas
    .filter((nota) => nota.pastaId === id)
    .forEach((nota) => definirPastaDaNota(nota, null));

  salvarPastasNotas(obterPastasNotas().filter((p) => p.id !== id));
}

function definirPastaDaNota(nota, pastaId) {
  if (nota.id.startsWith("extra-")) {
    const extras = obterNotasExtras();
    const indice = extras.findIndex((n) => n.id === nota.id);
    if (indice !== -1) {
      extras[indice].pastaId = pastaId;
      localStorage.setItem("notas_extras", JSON.stringify(extras));
    }
  } else {
    const overrides = JSON.parse(localStorage.getItem("notas_override") || "{}");
    overrides[nota.id] = { ...(overrides[nota.id] || {}), pastaId };
    localStorage.setItem("notas_override", JSON.stringify(overrides));
  }
}

function excluirNota(nota) {
  if (nota.id.startsWith("extra-")) {
    const extras = obterNotasExtras().filter((n) => n.id !== nota.id);
    localStorage.setItem("notas_extras", JSON.stringify(extras));
  } else {
    const removidas = JSON.parse(localStorage.getItem("notas_removidas") || "[]");
    if (!removidas.includes(nota.id)) {
      removidas.push(nota.id);
      localStorage.setItem("notas_removidas", JSON.stringify(removidas));
    }
  }
}

// --- Ordenação das notas de Estudo (dentro de pastas ou soltas) ---

function obterNotasOrdem() {
  return JSON.parse(localStorage.getItem("notas_ordem") || "{}");
}

function ordenarNotasComOverride(chave, notas) {
  const ordemSalva = obterNotasOrdem()[chave];
  if (!ordemSalva || ordemSalva.length === 0) return notas;

  const porId = new Map(notas.map((n) => [n.id, n]));
  const existentes = [];
  ordemSalva.forEach((id) => {
    if (porId.has(id)) {
      existentes.push(porId.get(id));
      porId.delete(id);
    }
  });
  // notas novas (fora da ordem salva) entram no topo
  return [...porId.values(), ...existentes];
}

function obterNotasEstudoTodasComPasta() {
  const extras = obterNotasExtras();
  const fixas = obterNotasFixasComOverrides();
  return [...extras, ...fixas].filter((n) => n.tag === "Estudo");
}

function obterNotasDoGrupoEstudo(chave) {
  const todas = obterNotasEstudoTodasComPasta();
  const doGrupo =
    chave === CHAVE_SOLTAS_ESTUDO
      ? todas.filter((n) => !n.pastaId)
      : todas.filter((n) => n.pastaId === chave);
  return ordenarNotasComOverride(chave, doGrupo);
}

function moverNotaEstudo(nota, direcao, chaveGrupo) {
  const notasDoGrupo = obterNotasDoGrupoEstudo(chaveGrupo);
  const ids = notasDoGrupo.map((n) => n.id);
  const posicao = ids.indexOf(nota.id);
  const novaPosicao = direcao === "cima" ? posicao - 1 : posicao + 1;
  if (novaPosicao < 0 || novaPosicao >= ids.length) return;

  [ids[posicao], ids[novaPosicao]] = [ids[novaPosicao], ids[posicao]];

  const ordens = obterNotasOrdem();
  ordens[chaveGrupo] = ids;
  localStorage.setItem("notas_ordem", JSON.stringify(ordens));
}

function formatarDataAtual() {
  const agora = new Date();
  const hora = String(agora.getHours()).padStart(2, "0");
  const minuto = String(agora.getMinutes()).padStart(2, "0");
  return `Hoje, ${hora}:${minuto}`;
}

function abrirNotaNoEditor(nota) {
  sessionStorage.setItem("nota_id", nota.id);
  sessionStorage.setItem("nota_titulo", nota.titulo);
  sessionStorage.setItem("nota_corpo", nota.corpo);
  sessionStorage.setItem("nota_tag", nota.tag);
  sessionStorage.setItem("nota_tagcor", nota.tagcor);
  sessionStorage.setItem("nota_data", nota.data);
  window.location.href = "nota-editor.html";
}

function obterNotasFixasComOverrides() {
  const overrides = JSON.parse(localStorage.getItem("notas_override") || "{}");
  const removidas = JSON.parse(localStorage.getItem("notas_removidas") || "[]");
  return notasFixas
    .filter((nota) => !removidas.includes(nota.id))
    .map((nota) => {
      const over = overrides[nota.id];
      return over ? { ...nota, ...over } : nota;
    });
}

function obterNotasExtras() {
  const notasExtras = JSON.parse(localStorage.getItem("notas_extras") || "[]");
  let precisaSalvar = false;

  notasExtras.forEach((nota) => {
    if (!nota.id) {
      nota.id = `extra-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      precisaSalvar = true;
    }
  });

  if (precisaSalvar) {
    localStorage.setItem("notas_extras", JSON.stringify(notasExtras));
  }

  return notasExtras;
}

let filtroNotaAtivo = "todas";
let buscaNotaAtiva = "";

function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function selecionarFiltroNota(tipo) {
  filtroNotaAtivo = tipo;

  document.querySelectorAll("#filtros-notas .filtro").forEach((el) => {
    const ativo = el.dataset.tipo === tipo;
    el.classList.toggle("ativo", ativo);
    el.classList.toggle("inativo", !ativo);
  });

  renderizarNotas();
}

// --- Menu de 3 pontos (compartilhado por notas e pastas) ---

function criarBotaoMenuNota(aoClicar) {
  const btn = document.createElement("button");
  btn.className = "material-icons btn-menu-nota";
  btn.textContent = "more_vert";
  btn.style.cssText = `
    position:absolute; top:8px; right:8px;
    background:transparent; border:none; cursor:pointer;
    color:#666; font-size:18px; width:26px; height:26px;
    display:flex; align-items:center; justify-content:center;
    border-radius:8px; z-index:2;
  `;
  btn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    aoClicar(btn);
  };
  return btn;
}

function fecharMenuFlutuanteNotas() {
  const existente = document.getElementById("menu-flutuante-notas");
  if (existente) existente.remove();
}

function abrirMenuAcoesNota(btnRef, opcoes) {
  fecharMenuFlutuanteNotas();

  const celular = document.querySelector(".celular");
  celular.style.position = "relative";

  const rectBtn = btnRef.getBoundingClientRect();
  const rectCelular = celular.getBoundingClientRect();

  const menu = document.createElement("div");
  menu.id = "menu-flutuante-notas";
  menu.style.cssText = `
    position:absolute;
    top:${rectBtn.bottom - rectCelular.top + 4}px;
    left:${Math.min(rectBtn.left - rectCelular.left, rectCelular.width - 175)}px;
    background:#1A1A1A;
    border:1px solid #2A2A2A;
    border-radius:10px;
    padding:6px;
    min-width:165px;
    z-index:30;
    box-shadow:0 4px 16px rgba(0,0,0,0.4);
    display:flex;
    flex-direction:column;
  `;

  opcoes.forEach((op) => {
    const item = document.createElement("button");
    item.textContent = op.label;
    item.style.cssText = `
      background:transparent; border:none; text-align:left;
      padding:8px 10px; font-size:12.5px; cursor:pointer;
      border-radius:6px; color:${op.perigo ? "#FF5C5C" : "#EEE"};
    `;
    item.onmouseenter = () => (item.style.background = "#242424");
    item.onmouseleave = () => (item.style.background = "transparent");
    item.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      fecharMenuFlutuanteNotas();
      op.aoClicar();
    };
    menu.appendChild(item);
  });

  celular.appendChild(menu);

  setTimeout(() => {
    document.addEventListener("click", fecharMenuFlutuanteNotas, { once: true });
  }, 0);
}

function abrirMenuNota(nota, btnRef, contexto) {
  const opcoes = [];
  const ehEstudo = nota.tag === "Estudo";
  const chaveGrupo = contexto === "pasta" ? pastaNotaAtual : CHAVE_SOLTAS_ESTUDO;

  if (ehEstudo && (contexto === "solta" || contexto === "pasta")) {
    opcoes.push({
      label: "Mover para cima",
      aoClicar: () => {
        moverNotaEstudo(nota, "cima", chaveGrupo);
        contexto === "pasta" ? renderizarPastaNotas() : renderizarNotas();
      },
    });
    opcoes.push({
      label: "Mover para baixo",
      aoClicar: () => {
        moverNotaEstudo(nota, "baixo", chaveGrupo);
        contexto === "pasta" ? renderizarPastaNotas() : renderizarNotas();
      },
    });
  }

  if (ehEstudo) {
    if (nota.pastaId) {
      opcoes.push({
        label: "Remover da pasta",
        aoClicar: () => {
          definirPastaDaNota(nota, null);
          contexto === "pasta" ? renderizarPastaNotas() : renderizarNotas();
        },
      });
    } else {
      opcoes.push({
        label: "Adicionar a pasta",
        aoClicar: () => abrirSeletorPastaNota(nota),
      });
    }
  }

  opcoes.push({
    label: "Excluir nota",
    perigo: true,
    aoClicar: () => {
      if (!confirm(`Excluir a nota "${nota.titulo}"?`)) return;
      excluirNota(nota);
      contexto === "pasta" ? renderizarPastaNotas() : renderizarNotas();
    },
  });

  abrirMenuAcoesNota(btnRef, opcoes);
}

function abrirMenuPastaNota(pasta, btnRef) {
  const opcoes = [
    {
      label: "Renomear",
      aoClicar: () => renomearPastaNotaPrompt(pasta),
    },
    {
      label: "Excluir",
      perigo: true,
      aoClicar: () => {
        if (
          !confirm(`Excluir a pasta "${pasta.nome}"? As notas voltarão a ficar soltas.`)
        )
          return;
        excluirPastaNotaObj(pasta.id);
        renderizarNotas();
      },
    },
  ];
  abrirMenuAcoesNota(btnRef, opcoes);
}

function renomearPastaNotaPrompt(pasta) {
  const novoNome = prompt("Novo nome da pasta:", pasta.nome);
  if (!novoNome || !novoNome.trim()) return;
  renomearPastaNotaObj(pasta.id, novoNome.trim());
  renderizarNotas();
  if (pastaNotaAtual === pasta.id) {
    const titulo = document.getElementById("pasta-notas-titulo");
    if (titulo) titulo.textContent = novoNome.trim();
  }
}

function abrirSeletorPastaNota(nota) {
  const celular = document.querySelector(".celular");
  celular.style.position = "relative";

  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position:absolute; top:0; left:0; width:100%; height:100%;
    background:rgba(0,0,0,0.7); z-index:25;
    display:flex; align-items:center; justify-content:center;
  `;

  const modal = document.createElement("div");
  modal.style.cssText = `
    background:#1A1A1A; border-radius:16px; padding:20px;
    width:85%; max-height:70%; overflow-y:auto;
    display:flex; flex-direction:column; gap:10px;
    border:1px solid #2A2A2A;
  `;

  const titulo = document.createElement("p");
  titulo.textContent = "Adicionar a pasta";
  titulo.style.cssText = `color:#FFF; font-size:14px; font-weight:600; margin:0;`;
  modal.appendChild(titulo);

  const pastas = obterPastasNotas();

  if (pastas.length === 0) {
    const vazio = document.createElement("p");
    vazio.textContent = "Nenhuma pasta criada ainda.";
    vazio.style.cssText = `color:#666; font-size:12.5px; margin:0;`;
    modal.appendChild(vazio);
  }

  pastas.forEach((pasta) => {
    const item = document.createElement("button");
    item.textContent = pasta.nome;
    item.style.cssText = `
      background:#141414; border:1px solid #2A2A2A; border-radius:10px;
      padding:10px 14px; color:#EEE; font-size:13px; text-align:left; cursor:pointer;
    `;
    item.onclick = () => {
      definirPastaDaNota(nota, pasta.id);
      overlay.remove();
      renderizarNotas();
    };
    modal.appendChild(item);
  });

  const btnCancelar = document.createElement("button");
  btnCancelar.textContent = "Cancelar";
  btnCancelar.style.cssText = `
    background:transparent; border:1px solid #2A2A2A; border-radius:10px;
    color:#666; padding:8px 16px; font-size:13px; cursor:pointer; align-self:flex-end;
  `;
  btnCancelar.onclick = () => overlay.remove();
  modal.appendChild(btnCancelar);

  overlay.appendChild(modal);
  celular.appendChild(overlay);
}

function abrirSeletorNotasSoltasParaPasta() {
  if (pastaNotaAtual === null) return;
  const celular = document.querySelector(".celular");
  celular.style.position = "relative";

  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position:absolute; top:0; left:0; width:100%; height:100%;
    background:rgba(0,0,0,0.7); z-index:25;
    display:flex; align-items:center; justify-content:center;
  `;

  const modal = document.createElement("div");
  modal.style.cssText = `
    background:#1A1A1A; border-radius:16px; padding:20px;
    width:85%; max-height:70%; overflow-y:auto;
    display:flex; flex-direction:column; gap:10px;
    border:1px solid #2A2A2A;
  `;

  const titulo = document.createElement("p");
  titulo.textContent = "Adicionar notas soltas";
  titulo.style.cssText = `color:#FFF; font-size:14px; font-weight:600; margin:0;`;
  modal.appendChild(titulo);

  const soltas = obterNotasEstudoTodasComPasta().filter((n) => !n.pastaId);

  if (soltas.length === 0) {
    const vazio = document.createElement("p");
    vazio.textContent = "Nenhuma nota solta de Estudo.";
    vazio.style.cssText = `color:#666; font-size:12.5px; margin:0;`;
    modal.appendChild(vazio);
  }

  soltas.forEach((nota) => {
    const item = document.createElement("button");
    item.textContent = nota.titulo;
    item.style.cssText = `
      background:#141414; border:1px solid #2A2A2A; border-radius:10px;
      padding:10px 14px; color:#EEE; font-size:13px; text-align:left; cursor:pointer;
    `;
    item.onclick = () => {
      definirPastaDaNota(nota, pastaNotaAtual);
      overlay.remove();
      renderizarPastaNotas();
    };
    modal.appendChild(item);
  });

  const btnFechar = document.createElement("button");
  btnFechar.textContent = "Fechar";
  btnFechar.style.cssText = `
    background:transparent; border:1px solid #2A2A2A; border-radius:10px;
    color:#666; padding:8px 16px; font-size:13px; cursor:pointer; align-self:flex-end;
  `;
  btnFechar.onclick = () => overlay.remove();
  modal.appendChild(btnFechar);

  overlay.appendChild(modal);
  celular.appendChild(overlay);
}

// --- Cards ---

function criarCardNota(nota, contexto) {
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

  card.appendChild(criarBotaoMenuNota((btnRef) => abrirMenuNota(nota, btnRef, contexto)));

  return card;
}

function criarCardPasta(pasta, notasDaPasta) {
  const card = document.createElement("div");
  card.className = "pasta-nota-card";
  card.onclick = () => abrirPastaNotas(pasta.id);

  card.innerHTML = `
    <span class="material-icons icone-pasta">folder</span>
    <div class="pasta-nota-info">
      <div class="pasta-nota-nome">${pasta.nome}</div>
      <div class="pasta-nota-contagem">${notasDaPasta.length} nota${notasDaPasta.length === 1 ? "" : "s"}</div>
    </div>
  `;

  card.appendChild(criarBotaoMenuNota((btnRef) => abrirMenuPastaNota(pasta, btnRef)));

  return card;
}

// --- Tela de pasta de notas ---

function abrirPastaNotas(pastaId) {
  const pasta = obterPastasNotas().find((p) => p.id === pastaId);
  if (!pasta) return;

  pastaNotaAtual = pastaId;

  document.getElementById("pasta-notas-titulo").textContent = pasta.nome;
  document.getElementById("tela-notas").classList.add("oculto");
  document.getElementById("tela-pasta-notas").classList.remove("oculto");

  renderizarPastaNotas();
}

function fecharPastaNotas() {
  pastaNotaAtual = null;
  document.getElementById("tela-pasta-notas").classList.add("oculto");
  document.getElementById("tela-notas").classList.remove("oculto");
  document.getElementById("lista-pasta-notas").innerHTML = "";
  renderizarNotas();
}

function voltarOuHistoricoNotas() {
  if (pastaNotaAtual !== null) {
    fecharPastaNotas();
  } else {
    history.back();
  }
}

function renderizarPastaNotas() {
  const lista = document.getElementById("lista-pasta-notas");
  if (!lista || pastaNotaAtual === null) return;
  lista.innerHTML = "";

  const notas = obterNotasDoGrupoEstudo(pastaNotaAtual);

  if (notas.length === 0) {
    const vazio = document.createElement("p");
    vazio.style.cssText = `color:#555; font-size:13px; text-align:center; padding:24px 0;`;
    vazio.textContent = "Nenhuma nota nesta pasta.";
    lista.appendChild(vazio);
    return;
  }

  notas.forEach((nota) => {
    lista.appendChild(criarCardNota(nota, "pasta"));
  });
}

// --- Lista principal de notas ---

function renderizarNotasAgrupadasPorPasta(lista, todasNotas) {
  const notasEstudo = todasNotas.filter((n) => n.tag === "Estudo");
  const pastas = obterPastasNotas();

  const contador = document.getElementById("contador-notas");
  if (contador) {
    contador.textContent = `${notasEstudo.length} nota${notasEstudo.length === 1 ? "" : "s"}`;
  }

  if (notasEstudo.length === 0 && pastas.length === 0) {
    const vazio = document.createElement("p");
    vazio.style.cssText = `color:#555; font-size:13px; text-align:center; padding:24px 0;`;
    vazio.textContent = "Nenhuma nota encontrada.";
    lista.appendChild(vazio);
    return;
  }

  pastas.forEach((pasta) => {
    const notasDaPasta = notasEstudo.filter((n) => n.pastaId === pasta.id);
    lista.appendChild(criarCardPasta(pasta, notasDaPasta));
  });

  const soltas = ordenarNotasComOverride(
    CHAVE_SOLTAS_ESTUDO,
    notasEstudo.filter((n) => !n.pastaId),
  );

  if (soltas.length > 0) {
    if (pastas.length > 0) {
      const secaoTitulo = document.createElement("div");
      secaoTitulo.className = "secao-titulo-notas";
      secaoTitulo.textContent = "Sem pasta";
      lista.appendChild(secaoTitulo);
    }
    soltas.forEach((nota) => {
      lista.appendChild(criarCardNota(nota, "solta"));
    });
  }
}

function renderizarNotas() {
  const lista = document.getElementById("lista-notas");
  if (!lista) return;
  lista.innerHTML = "";

  const notasExtras = obterNotasExtras();
  const todasNotas = [...notasExtras, ...obterNotasFixasComOverrides()];

  if (filtroNotaAtivo === "estudo" && !buscaNotaAtiva) {
    renderizarNotasAgrupadasPorPasta(lista, todasNotas);
    return;
  }

  const notasFiltradas = todasNotas
    .filter(
      (nota) => filtroNotaAtivo === "todas" || nota.tag.toLowerCase() === filtroNotaAtivo,
    )
    .filter((nota) => {
      if (!buscaNotaAtiva) return true;
      const corpoTexto = nota.corpo.replace(/<[^>]+>/g, "");
      const alvo = normalizarTexto(`${nota.titulo} ${corpoTexto}`);
      return alvo.includes(buscaNotaAtiva);
    });

  const contador = document.getElementById("contador-notas");
  if (contador) {
    contador.textContent = `${notasFiltradas.length} nota${notasFiltradas.length === 1 ? "" : "s"}`;
  }

  if (notasFiltradas.length === 0) {
    const vazio = document.createElement("p");
    vazio.style.cssText = `color:#555; font-size:13px; text-align:center; padding:24px 0;`;
    vazio.textContent = "Nenhuma nota encontrada.";
    lista.appendChild(vazio);
    return;
  }

  notasFiltradas.forEach((nota) => {
    lista.appendChild(criarCardNota(nota, "flat"));
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

    const notasExtras = obterNotasExtras();
    notasExtras.unshift({
      id: `extra-${Date.now()}`,
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

  const grupoTipo = document.createElement("div");
  grupoTipo.style.cssText = `display:flex; flex-direction:column; gap:6px;`;
  grupoTipo.appendChild(labelTipo);
  grupoTipo.appendChild(selectTipo);

  modal.appendChild(titulo);
  modal.appendChild(inputTitulo);
  modal.appendChild(textareaCorpo);
  modal.appendChild(grupoTipo);
  modal.appendChild(botoes);
  overlay.appendChild(modal);
  celular.appendChild(overlay);

  setTimeout(() => inputTitulo.focus(), 100);
}

function abrirCriarPastaNota() {
  const celular = document.querySelector(".celular");
  celular.style.position = "relative";

  const overlay = document.createElement("div");
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
    display: flex;
    flex-direction: column;
    gap: 12px;
    border: 1px solid #2A2A2A;
  `;

  const titulo = document.createElement("p");
  titulo.textContent = "Nova pasta";
  titulo.style.cssText = `color:#FFF; font-size:14px; font-weight:600; margin:0;`;

  const inputNome = document.createElement("input");
  inputNome.type = "text";
  inputNome.placeholder = "Nome da pasta";
  inputNome.style.cssText = `
    background:#141414; border:1px solid #2A2A2A; border-radius:10px;
    padding:10px 14px; color:#FFF; font-size:13px; outline:none;
  `;

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
    const nome = inputNome.value.trim();
    if (!nome) return;
    criarPastaNotaObj(nome);
    overlay.remove();
    renderizarNotas();
  };

  botoes.appendChild(btnCancelar);
  botoes.appendChild(btnCriar);

  modal.appendChild(titulo);
  modal.appendChild(inputNome);
  modal.appendChild(botoes);
  overlay.appendChild(modal);
  celular.appendChild(overlay);

  setTimeout(() => inputNome.focus(), 100);
}

function abrirEscolhaNovo() {
  const celular = document.querySelector(".celular");
  celular.style.position = "relative";

  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.7);
    z-index: 20;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  `;
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };

  const modal = document.createElement("div");
  modal.style.cssText = `
    background: #1A1A1A;
    border-radius: 16px 16px 0 0;
    padding: 16px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
    border: 1px solid #2A2A2A;
    border-bottom: none;
  `;

  const estiloOpcao = `
    background:#141414; border:1px solid #2A2A2A; border-radius:10px;
    padding:12px 14px; color:#EEE; font-size:14px; text-align:left; cursor:pointer;
  `;

  const opcaoNota = document.createElement("button");
  opcaoNota.textContent = "Nova nota";
  opcaoNota.style.cssText = estiloOpcao;
  opcaoNota.onclick = () => {
    overlay.remove();
    abrirCriarNota();
  };

  const opcaoPasta = document.createElement("button");
  opcaoPasta.textContent = "Nova pasta";
  opcaoPasta.style.cssText = estiloOpcao;
  opcaoPasta.onclick = () => {
    overlay.remove();
    abrirCriarPastaNota();
  };

  modal.appendChild(opcaoNota);
  modal.appendChild(opcaoPasta);
  overlay.appendChild(modal);
  celular.appendChild(overlay);
}

document.querySelector(".btn-nova-nota").onclick = abrirEscolhaNovo;

document.querySelectorAll("#filtros-notas .filtro").forEach((el) => {
  el.onclick = () => selecionarFiltroNota(el.dataset.tipo);
});

const inputBuscaNotas = document.getElementById("busca-notas");
if (inputBuscaNotas) {
  inputBuscaNotas.addEventListener("input", () => {
    buscaNotaAtiva = normalizarTexto(inputBuscaNotas.value.trim());
    renderizarNotas();
  });
}

renderizarNotas();
