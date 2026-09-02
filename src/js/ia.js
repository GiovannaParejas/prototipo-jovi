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

if (foto !== null && resumos[foto]) {
    const resumo = resumos[foto];
    const iaConteudo = document.getElementById('ia-conteudo');
    iaConteudo.innerHTML = `
        <div class="ia-resumo">
            <h2 class="resumo-titulo">${resumo.titulo}</h2>
            <div class="resumo-corpo" id="resumo-corpo"></div>
        </div>
    `;
    resumo.corpo.split('\n\n').forEach(p => {
        const el = document.createElement('p');
        el.textContent = p;
        document.getElementById('resumo-corpo').appendChild(el);
    });
} else {
  // Veio do app IA — mostra conversa
  document.getElementById("ia-conteudo").innerHTML = `
        <div class="msg-wrapper usuario">
            <div class="msg usuario">Pode me fazer um flashcard de <span class="msg-destaque">Design Thinking - Process</span>?</div>
        </div>
        <div class="msg-wrapper ia">
            <div class="msg ia">Claro! Aqui está o flashcard de <span class="msg-destaque">Design Thinking - Process</span> com os principais conceitos da aula.</div>
        </div>
        <div class="msg-wrapper ia">
            <div class="pdf-card">
                <div class="pdf-card-info">
                    <span class="material-icons pdf-icon">picture_as_pdf</span>
                    <div>
                        <p class="pdf-nome">Flashcard_DesignThinking.pdf</p>
                        <p class="pdf-peso">48 KB</p>
                    </div>
                </div>
                <button class="pdf-download">
                    <span class="material-icons">download</span>
                </button>
            </div>
        </div>
        <div class="msg-wrapper usuario">
            <div class="msg usuario">Obrigada! Tenho uma prova semana que vem, pode me fazer perguntas sobre a matéria?</div>
        </div>
        <div class="msg-wrapper ia">
            <div class="msg ia">Com certeza! Vamos treinar. Primeira pergunta:</div>
        </div>
        <div class="msg-wrapper ia">
            <div class="msg ia pergunta">O que é Design Thinking e qual é o seu principal objetivo?</div>
        </div>
    `;
}

const iaConteudo = document.getElementById("ia-conteudo");
if (iaConteudo) iaConteudo.scrollTop = iaConteudo.scrollHeight;
