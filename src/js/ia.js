const params = new URLSearchParams(window.location.search);
const modoResumoFoto = params.get("foto") !== null;

let historicoConversa = [];
let contextoConversa = null;

function escaparHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function formatarMarkdown(texto) {
  let html = escaparHtml(texto);

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
  html = html.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, "<em>$1</em>");
  html = html.replace(/`(.+?)`/g, "<code>$1</code>");
  html = html.replace(/^\s*---+\s*$/gm, "<hr>");
  html = html.replace(/^#{1,6}\s+(.+)$/gm, "<strong>$1</strong>");

  const linhas = html.split("\n");
  const resultado = [];
  let dentroLista = null;

  linhas.forEach((linha) => {
    const itemUl = linha.match(/^\s*[-*]\s+(.+)$/);
    const itemOl = linha.match(/^\s*\d+\.\s+(.+)$/);

    if (itemUl) {
      if (dentroLista !== "ul") {
        if (dentroLista) resultado.push(`</${dentroLista}>`);
        resultado.push("<ul>");
        dentroLista = "ul";
      }
      resultado.push(`<li>${itemUl[1]}</li>`);
    } else if (itemOl) {
      if (dentroLista !== "ol") {
        if (dentroLista) resultado.push(`</${dentroLista}>`);
        resultado.push("<ol>");
        dentroLista = "ol";
      }
      resultado.push(`<li>${itemOl[1]}</li>`);
    } else {
      if (dentroLista) {
        resultado.push(`</${dentroLista}>`);
        dentroLista = null;
      }
      const linhaAparada = linha.trim();
      if (linhaAparada === "<hr>") {
        resultado.push("<hr>");
      } else if (linhaAparada) {
        resultado.push(`<p>${linha}</p>`);
      }
    }
  });
  if (dentroLista) resultado.push(`</${dentroLista}>`);

  return resultado.join("");
}

function criarBolhaMensagem(autor, texto) {
  const wrapper = document.createElement("div");
  wrapper.className = `msg-wrapper ${autor}`;

  const bolha = document.createElement("div");
  bolha.className = `msg ${autor}`;
  if (autor === "ia") {
    bolha.innerHTML = formatarMarkdown(texto);
  } else {
    bolha.textContent = texto;
  }

  wrapper.appendChild(bolha);
  return wrapper;
}

function rolarParaFinal() {
  const iaConteudo = document.getElementById("ia-conteudo");
  if (iaConteudo) iaConteudo.scrollTop = iaConteudo.scrollHeight;
}

function mostrarDigitando() {
  const iaConteudo = document.getElementById("ia-conteudo");
  const wrapper = document.createElement("div");
  wrapper.className = "msg-wrapper ia";
  wrapper.id = "msg-digitando";

  const bolha = document.createElement("div");
  bolha.className = "msg ia";
  bolha.textContent = "Digitando...";

  wrapper.appendChild(bolha);
  iaConteudo.appendChild(wrapper);
  rolarParaFinal();
}

function removerDigitando() {
  const el = document.getElementById("msg-digitando");
  if (el) el.remove();
}

async function enviarParaIA(texto) {
  const iaConteudo = document.getElementById("ia-conteudo");
  const input = document.getElementById("ia-input");
  const botaoEnviar = document.querySelector(".ia-enviar");

  iaConteudo.appendChild(criarBolhaMensagem("usuario", texto));
  historicoConversa.push({ autor: "usuario", texto });
  rolarParaFinal();

  input.value = "";
  input.disabled = true;
  botaoEnviar.disabled = true;
  mostrarDigitando();

  try {
    const response = await fetch("https://prototipo-jovi.vercel.app/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mensagens: historicoConversa,
        contexto: contextoConversa,
      }),
    });

    const data = await response.json();
    removerDigitando();

    if (data.erro) throw new Error(data.erro);

    iaConteudo.appendChild(criarBolhaMensagem("ia", data.texto));
    historicoConversa.push({ autor: "ia", texto: data.texto });
  } catch (err) {
    removerDigitando();
    console.error("Erro ao conversar com a IA:", err);
    iaConteudo.appendChild(
      criarBolhaMensagem("ia", "Desculpe, não consegui responder agora. Tente novamente."),
    );
  } finally {
    input.disabled = false;
    botaoEnviar.disabled = false;
    input.focus();
    rolarParaFinal();
  }
}

function configurarEnvio() {
  const input = document.getElementById("ia-input");
  const botaoEnviar = document.querySelector(".ia-enviar");
  if (!input || !botaoEnviar) return;

  const tentarEnviar = () => {
    const texto = input.value.trim();
    if (!texto) return;
    enviarParaIA(texto);
  };

  botaoEnviar.onclick = tentarEnviar;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") tentarEnviar();
  });
}

const iaConteudo = document.getElementById("ia-conteudo");

function iniciarComoChatGeral() {
  iaConteudo.innerHTML = "";
  iaConteudo.appendChild(
    criarBolhaMensagem("ia", "Oi! Eu sou a JOVI. Pode me perguntar qualquer coisa sobre seus estudos."),
  );
}

async function iniciarComoResumoDeFoto() {
  const titulo = sessionStorage.getItem("ia_foto_titulo");
  const texto = sessionStorage.getItem("ia_foto_texto");
  sessionStorage.removeItem("ia_foto_titulo");
  sessionStorage.removeItem("ia_foto_texto");

  if (!titulo || !texto) {
    iniciarComoChatGeral();
    return;
  }

  contextoConversa = `${titulo}\n\n${texto}`;
  const tituloHeader = document.getElementById("ia-titulo");
  if (tituloHeader) tituloHeader.textContent = titulo;

  await enviarParaIA(`Resuma o conteúdo da foto "${titulo}" para mim.`);
}

iaConteudo.innerHTML = "";
if (modoResumoFoto) {
  iniciarComoResumoDeFoto();
} else {
  iniciarComoChatGeral();
}

configurarEnvio();
rolarParaFinal();
