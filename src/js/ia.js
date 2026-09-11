const params = new URLSearchParams(window.location.search);
const foto = params.get("foto");

const resumos = {
  0: {
    titulo: "Design Thinking - Process (Resumo)",
    corpo: `Design Thinking é uma abordagem de inovação centrada no usuário, que utiliza pesquisa para entender profundamente suas necessidades, dores e comportamentos, com o objetivo de criar soluções mais relevantes.

Inovação é um processo criativo que gera impacto positivo, podendo ser incremental (melhorias contínuas) ou disruptiva (mudanças que transformam mercados e comportamentos).

Para inovar de forma eficaz, uma solução deve equilibrar três pilares: ser desejável para as pessoas, viável como negócio e tecnicamente possível de ser implementada.`,
  },
  1: {
    titulo: "Holiday at Sea (Resumo)",
    corpo: `O texto relata a experiência de uma família em um cruzeiro pelo Caribe, que inicialmente hesitava por ter quatro filhos menores de 14 anos.

A bordo, as crianças tinham clubes e atividades próprias, enquanto os pais podiam relaxar. As instalações incluíam lojas, pista de corrida e restaurantes variados.

O autor recomenda cruzeiros, mas aconselha buscar descontos antecipados. Alerta que celulares não funcionam no mar e que gorjetas são esperadas, porém orientadas.`,
  },
  2: {
    titulo: "Férias no Mar — Tradução (Resumo)",
    corpo: `O texto narra a experiência de uma família em um cruzeiro pelo Caribe, inicialmente receosa por ter quatro filhos pequenos.

A bordo, as crianças participavam de clubes por faixa etária, enquanto os pais relaxavam. As instalações eram excelentes: lojas, quadras e restaurantes de qualidade.

O autor recomenda cruzeiros e orienta buscar os melhores preços. Lembra que celulares não funcionam no mar e que gorjetas são esperadas, mas sempre informadas.`,
  },
};

let historicoConversa = [];
let contextoConversa = null;

function criarBolhaMensagem(autor, texto) {
  const wrapper = document.createElement("div");
  wrapper.className = `msg-wrapper ${autor}`;

  const bolha = document.createElement("div");
  bolha.className = `msg ${autor}`;
  bolha.textContent = texto;

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

if (foto !== null && resumos[foto]) {
  const resumo = resumos[foto];
  contextoConversa = `${resumo.titulo}\n\n${resumo.corpo}`;

  iaConteudo.innerHTML = `
        <div class="ia-resumo">
            <h2 class="resumo-titulo">${resumo.titulo}</h2>
            <div class="resumo-corpo" id="resumo-corpo"></div>
        </div>
    `;
  resumo.corpo.split("\n\n").forEach((p) => {
    const el = document.createElement("p");
    el.textContent = p;
    document.getElementById("resumo-corpo").appendChild(el);
  });
} else {
  iaConteudo.innerHTML = "";
  iaConteudo.appendChild(
    criarBolhaMensagem("ia", "Oi! Eu sou a JOVI. Pode me perguntar qualquer coisa sobre seus estudos."),
  );
}

configurarEnvio();
rolarParaFinal();
