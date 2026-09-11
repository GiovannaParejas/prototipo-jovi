const params = new URLSearchParams(window.location.search);

const notaId = sessionStorage.getItem('nota_id');
const titulo = sessionStorage.getItem('nota_titulo') || params.get('titulo');
const corpo = sessionStorage.getItem('nota_corpo') || params.get('corpo');
const notaTag = sessionStorage.getItem('nota_tag') || params.get('tag');
const notaTagcor = sessionStorage.getItem('nota_tagcor') || params.get('tagcor');
const notaData = sessionStorage.getItem('nota_data');

sessionStorage.removeItem('nota_id');
sessionStorage.removeItem('nota_titulo');
sessionStorage.removeItem('nota_corpo');
sessionStorage.removeItem('nota_tag');
sessionStorage.removeItem('nota_tagcor');
sessionStorage.removeItem('nota_data');

if (titulo) {
    document.querySelector('.nota-titulo-edit').textContent = titulo;
    document.querySelector('.header-titulo').textContent = titulo;
}

if (corpo) {
    const paragrafos = corpo.split('||');
    const html = paragrafos.map(p => `<p>${p}</p>`).join('');
    document.querySelector('.nota-corpo').innerHTML = html;
}

if (notaTag && notaTagcor) {
    document.getElementById('nota-tag-editor').textContent = notaTag;
    document.getElementById('nota-tag-editor').className = `nota-tag ${notaTagcor}`;
    if (notaData) {
        document.getElementById('nota-data-editor').textContent = notaData;
    }
    document.getElementById('nota-meta-editor').classList.remove('oculto');
}

if (notaId) {
    document.getElementById('btn-salvar-nota').classList.remove('oculto');
}

function formatar(comando) {
    document.execCommand(comando, false, null);
}

function mostrarAvisoNota(texto) {
    document.getElementById('aviso-nota')?.remove();
    const aviso = document.createElement('div');
    aviso.id = 'aviso-nota';
    aviso.textContent = texto;
    aviso.style.cssText = `
        position: absolute;
        bottom: 90px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.85);
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

function salvarNota() {
    if (!notaId) return;

    const novoTitulo = document.querySelector('.nota-titulo-edit').textContent.trim();
    if (!novoTitulo) {
        mostrarAvisoNota('Adicione um título antes de salvar.');
        return;
    }

    const paragrafos = [...document.querySelectorAll('.nota-corpo > *')].map(
        (p) => p.textContent,
    );
    const novoCorpo = paragrafos.length > 0
        ? paragrafos.join('||')
        : document.querySelector('.nota-corpo').textContent.trim();

    if (notaId.startsWith('extra-')) {
        const notasExtras = JSON.parse(localStorage.getItem('notas_extras') || '[]');
        const indice = notasExtras.findIndex((n) => n.id === notaId);
        if (indice !== -1) {
            notasExtras[indice].titulo = novoTitulo;
            notasExtras[indice].corpo = novoCorpo;
            localStorage.setItem('notas_extras', JSON.stringify(notasExtras));
        }
    } else {
        const overrides = JSON.parse(localStorage.getItem('notas_override') || '{}');
        overrides[notaId] = { titulo: novoTitulo, corpo: novoCorpo };
        localStorage.setItem('notas_override', JSON.stringify(overrides));
    }

    document.querySelector('.header-titulo').textContent = novoTitulo;
    mostrarAvisoNota('Nota salva!');
}
