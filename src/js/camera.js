let textoOCR = "";
let streamAtual = null;
let cameraAtiva = false;
let facingMode = "environment";
let modoAtual = null;

async function reconhecerComGemini(imagemBase64, modo = "copiar", idioma = "português") {
  const response = await fetch("https://prototipo-jovi.vercel.app/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64: imagemBase64, modo, idioma }),
  });

  const data = await response.json();
  if (data.erro) throw new Error(data.erro);
  return data.texto;
}
async function iniciarCamera() {
  const video = document.getElementById("camera-feed");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
    streamAtual = stream;
    cameraAtiva = true;
    video.removeAttribute("src");
    const source = video.querySelector("source");
    if (source) source.remove();
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    video.play();
  } catch (err) {
    console.error("Erro câmera:", err.name, err.message);
    cameraAtiva = false;
    video.srcObject = null;
    video.src = "../assets/loopmesa.mp4";
    video.loop = true;
    video.play();
  }
}

iniciarCamera();

document.querySelector(".btn-flip").onclick = async () => {
  if (!cameraAtiva) return;
  facingMode = facingMode === "environment" ? "user" : "environment";
  if (streamAtual) streamAtual.getTracks().forEach((t) => t.stop());
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode },
      audio: false,
    });
    streamAtual = stream;
    const video = document.getElementById("camera-feed");
    video.srcObject = stream;
    video.play();
  } catch (err) {
    console.error("Erro ao trocar câmera:", err);
  }
};

document.querySelectorAll(".modo").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".modo")
      .forEach((b) => b.classList.remove("ativo"));
    btn.classList.add("ativo");
  });
});

document.querySelectorAll(".zoom-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".zoom-btn")
      .forEach((b) => b.classList.remove("ativo"));
    btn.classList.add("ativo");
  });
});

function limparModo() {
  const video = document.getElementById("camera-feed");
  document.getElementById("msg-reconhecimento")?.remove();
  document.getElementById("resultado-traducao")?.remove();
  document.getElementById("canvas-selecao")?.remove();
  document.getElementById("resultado-copia")?.remove();
  document.getElementById("botoes-copia")?.remove();
  document.getElementById("aviso-copia")?.remove();
  document.getElementById("btn-fechar-selecao")?.remove();
  document.getElementById("caixa-texto-ocr")?.remove();
  document.getElementById("seletor-idioma")?.remove();
  video.style.display = "block";
  video.onended = null;
}

function voltarParaLoop() {
  const video = document.getElementById("camera-feed");
  limparModo();
  modoAtual = null;
  document.getElementById("btn-captura").style.borderColor = "";
  document.getElementById("btn-captura").onclick = null;
  document
    .querySelectorAll(".modo-acao")
    .forEach((b) => b.classList.remove("ativo"));
  if (cameraAtiva && streamAtual) {
    video.srcObject = streamAtual;
    video.loop = false;
    video.play();
  } else {
    video.srcObject = null;
    video.src = "../assets/loopmesa.mp4";
    video.loop = true;
    video.play();
  }
}

function mostrarAviso(texto) {
  document.getElementById("aviso-copia")?.remove();
  const aviso = document.createElement("div");
  aviso.id = "aviso-copia";
  aviso.textContent = texto;
  document.querySelector(".camera-wrapper").appendChild(aviso);
  setTimeout(() => aviso.remove(), 2000);
}

function capturarEReconhecer(video, wrapper) {
  const msg = document.createElement("div");
  msg.id = "msg-reconhecimento";
  msg.textContent = "Capturando...";
  wrapper.appendChild(msg);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const canvasCaptura = document.createElement("canvas");
      canvasCaptura.width = video.videoWidth || wrapper.offsetWidth;
      canvasCaptura.height = video.videoHeight || wrapper.offsetHeight;
      const ctxCaptura = canvasCaptura.getContext("2d");
      ctxCaptura.drawImage(
        video,
        0,
        0,
        canvasCaptura.width,
        canvasCaptura.height,
      );
      const imagemCapturada = canvasCaptura.toDataURL("image/png");
      const imagemBase64 = imagemCapturada.split(",")[1];

      const pixelData = ctxCaptura.getImageData(0, 0, 100, 100).data;
      const somaPixels = pixelData.reduce((acc, v) => acc + v, 0);
      const imagemVazia = somaPixels < 100;

      if (imagemVazia) {
        msg.textContent = "Erro ao capturar. Tente novamente.";
        setTimeout(() => msg.remove(), 2000);
        return;
      }

      msg.textContent = "Reconhecendo texto...";
      video.style.display = "none";

      const img = document.createElement("img");
      img.id = "resultado-copia";
      img.src = imagemCapturada;
      wrapper.appendChild(img);

      const btnFechar = document.createElement("button");
      btnFechar.id = "btn-fechar-selecao";
      btnFechar.innerHTML = '<span class="material-icons">close</span>';
      btnFechar.onclick = voltarParaLoop;
      wrapper.appendChild(btnFechar);

      reconhecerComGemini(imagemBase64)
        .then((texto) => {
          msg.remove();
          textoOCR =
            typeof texto === "string"
              ? texto
              : texto.map((l) => l.texto).join("\n");

          const caixaTexto = document.createElement("div");
          caixaTexto.id = "caixa-texto-ocr";
          caixaTexto.style.cssText = `
            position: absolute;
            bottom: 110px;
            left: 12px;
            right: 12px;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 247, 0, 0.4);
            border-radius: 12px;
            padding: 12px 14px;
            color: #FFFFFF;
            font-size: 12px;
            line-height: 1.7;
            max-height: 180px;
            overflow-y: auto;
            white-space: pre-wrap;
            z-index: 8;
          `;
          caixaTexto.textContent = textoOCR;
          wrapper.appendChild(caixaTexto);

          const botoes = document.createElement("div");
          botoes.id = "botoes-copia";
          botoes.style.cssText = `
            position: absolute;
            bottom: 50px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9;
            display: flex;
            justify-content: center;
          `;
          const btnCopiar = document.createElement("button");
          btnCopiar.textContent = "Copiar tudo";
          btnCopiar.style.cssText = `
            background: rgba(255, 247, 0, 0.9);
            color: #000;
            border: none;
            border-radius: 20px;
            padding: 10px 28px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            width: fit-content;
            margin: 0 auto;
          `;
          btnCopiar.onclick = () => {
            navigator.clipboard
              .writeText(textoOCR)
              .then(() => mostrarAviso("Tudo copiado!"));
          };
          botoes.appendChild(btnCopiar);
          wrapper.appendChild(botoes);
        })
        .catch((err) => {
          console.error("Erro Gemini:", err);
          msg.textContent = "Erro ao reconhecer texto.";
          setTimeout(() => msg.remove(), 2000);
        });
    });
  });
}

function capturarETradzuir(video, wrapper, idioma = "português") {
  const msg = document.createElement("div");
  msg.id = "msg-reconhecimento";
  msg.textContent = "Capturando...";
  wrapper.appendChild(msg);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const canvasCaptura = document.createElement("canvas");
      canvasCaptura.width = video.videoWidth || wrapper.offsetWidth;
      canvasCaptura.height = video.videoHeight || wrapper.offsetHeight;
      const ctxCaptura = canvasCaptura.getContext("2d");
      ctxCaptura.drawImage(
        video,
        0,
        0,
        canvasCaptura.width,
        canvasCaptura.height,
      );
      const imagemCapturada = canvasCaptura.toDataURL("image/png");
      const imagemBase64 = imagemCapturada.split(",")[1];

      const pixelData = ctxCaptura.getImageData(0, 0, 100, 100).data;
      const somaPixels = pixelData.reduce((acc, v) => acc + v, 0);
      const imagemVazia = somaPixels < 100;

      if (imagemVazia) {
        msg.textContent = "Erro ao capturar. Tente novamente.";
        setTimeout(() => msg.remove(), 2000);
        return;
      }

      msg.textContent = "Traduzindo...";
      video.style.display = "none";

      const img = document.createElement("img");
      img.id = "resultado-copia";
      img.src = imagemCapturada;
      wrapper.appendChild(img);

      const btnFechar = document.createElement("button");
      btnFechar.id = "btn-fechar-selecao";
      btnFechar.innerHTML = '<span class="material-icons">close</span>';
      btnFechar.onclick = voltarParaLoop;
      wrapper.appendChild(btnFechar);

      reconhecerComGemini(imagemBase64, "traduzir", idioma)
        .then((textoTraduzido) => {
          msg.remove();

          const caixaTexto = document.createElement("div");
          caixaTexto.id = "caixa-texto-ocr";
          caixaTexto.style.cssText = `
            position: absolute;
            bottom: 110px;
            left: 12px;
            right: 12px;
            background: rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 247, 0, 0.4);
            border-radius: 12px;
            padding: 12px 14px;
            color: #FFFFFF;
            font-size: 12px;
            line-height: 1.7;
            max-height: 180px;
            overflow-y: auto;
            white-space: pre-wrap;
            z-index: 8;
          `;
          caixaTexto.textContent = textoTraduzido;
          wrapper.appendChild(caixaTexto);

          const botoes = document.createElement("div");
          botoes.id = "botoes-copia";
          botoes.style.cssText = `
            position: absolute;
            bottom: 50px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9;
            display: flex;
            justify-content: center;
          `;
          const btnCopiar = document.createElement("button");
          btnCopiar.textContent = "Copiar tradução";
          btnCopiar.style.cssText = `
            background: rgba(255, 247, 0, 0.9);
            color: #000;
            border: none;
            border-radius: 20px;
            padding: 10px 28px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            width: fit-content;
            margin: 0 auto;
          `;
          btnCopiar.onclick = () => {
            navigator.clipboard
              .writeText(textoTraduzido)
              .then(() => mostrarAviso("Tradução copiada!"));
          };
          botoes.appendChild(btnCopiar);
          wrapper.appendChild(botoes);
        })
        .catch((err) => {
          console.error("Erro Gemini:", err);
          msg.textContent = "Erro ao traduzir.";
          setTimeout(() => msg.remove(), 2000);
        });
    });
  });
}

function capturarEDigitalizar(video, wrapper) {
  const msg = document.createElement("div");
  msg.id = "msg-reconhecimento";
  msg.textContent = "Digitalizando...";
  wrapper.appendChild(msg);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const canvasCaptura = document.createElement("canvas");
      canvasCaptura.width = video.videoWidth || wrapper.offsetWidth;
      canvasCaptura.height = video.videoHeight || wrapper.offsetHeight;
      const ctxCaptura = canvasCaptura.getContext("2d");
      ctxCaptura.drawImage(video, 0, 0, canvasCaptura.width, canvasCaptura.height);
      const imagemCapturada = canvasCaptura.toDataURL("image/png");

      const pixelData = ctxCaptura.getImageData(0, 0, 100, 100).data;
      const somaPixels = pixelData.reduce((acc, v) => acc + v, 0);
      const imagemVazia = somaPixels < 100;

      if (imagemVazia) {
        msg.textContent = "Erro ao capturar. Tente novamente.";
        setTimeout(() => msg.remove(), 2000);
        return;
      }

      msg.textContent = "Processando...";
      video.style.display = "none";

      const img = document.createElement("img");
      img.id = "resultado-copia";
      img.src = imagemCapturada;
img.style.cssText = `
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  object-fit: contain;
  z-index: 4;
  filter: contrast(1.8) brightness(1.15) saturate(0.3);
`;
      wrapper.appendChild(img);

      const btnFechar = document.createElement("button");
      btnFechar.id = "btn-fechar-selecao";
      btnFechar.innerHTML = '<span class="material-icons">close</span>';
      btnFechar.onclick = voltarParaLoop;
      wrapper.appendChild(btnFechar);

      setTimeout(() => {
        msg.remove();

        const botoes = document.createElement("div");
        botoes.id = "botoes-copia";
        botoes.style.cssText = `
          position: absolute;
          bottom: 50px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9;
          display: flex;
          gap: 10px;
          justify-content: center;
        `;

        const btnSalvar = document.createElement("button");
        btnSalvar.textContent = "Salvar";
        btnSalvar.style.cssText = `
          background: rgba(255, 247, 0, 0.9);
          color: #000;
          border: none;
          border-radius: 20px;
          padding: 10px 28px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        `;
btnSalvar.onclick = () => {
  const fotos = JSON.parse(localStorage.getItem('fotos_extras') || '[]');
  fotos.push({
    src: imagemCapturada,
    titulo: `Digitalização ${new Date().toLocaleDateString('pt-BR')}`,
    nota: null,
    tipo: 'pessoal'
  });
  localStorage.setItem('fotos_extras', JSON.stringify(fotos));
  console.log('Fotos salvas:', localStorage.getItem('fotos_extras'));
  mostrarAviso("Imagem salva na galeria!");
  setTimeout(() => window.location.href = "./galeria.html", 1500);
};

        botoes.appendChild(btnSalvar);
        wrapper.appendChild(botoes);
      }, 800);
    });
  });
}

function selecionarAcao(acao, el) {
  const btn = el.closest(".modo-acao");
  document
    .querySelectorAll(".modo-acao")
    .forEach((b) => b.classList.remove("ativo"));
  btn.classList.add("ativo");
  modoAtual = acao;
  limparModo();

  const video = document.getElementById("camera-feed");

if (cameraAtiva) {
    video.srcObject = streamAtual;
    video.play();

    if (acao === "digitalizar") {
      const wrapper = document.querySelector(".camera-wrapper");
      const btnCaptura = document.getElementById("btn-captura");
      btnCaptura.style.borderColor = "var(--cor-amarelo)";
      btnCaptura.onclick = () => {
        btnCaptura.onclick = null;
        capturarEDigitalizar(video, wrapper);
      };
    }

    if (acao === "copiar") {
      const wrapper = document.querySelector(".camera-wrapper");
      const btnCaptura = document.getElementById("btn-captura");
      btnCaptura.style.borderColor = "var(--cor-amarelo)";
      btnCaptura.onclick = () => {
        btnCaptura.onclick = null;
        capturarEReconhecer(video, wrapper);
      };
    }

    if (acao === "traduzir") {
      const wrapper = document.querySelector(".camera-wrapper");
      const seletor = document.createElement("div");
      seletor.id = "seletor-idioma";
      seletor.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 247, 0, 0.4);
        border-radius: 16px;
        padding: 20px;
        z-index: 10;
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-width: 220px;
      `;

      const titulo = document.createElement("p");
      titulo.textContent = "Traduzir para:";
      titulo.style.cssText = `color: #FFF; font-size: 13px; font-weight: 600; margin: 0 0 4px;`;
      seletor.appendChild(titulo);

      const idiomas = [
        { label: "🇧🇷 Português", value: "português" },
        { label: "🇺🇸 Inglês", value: "inglês" },
        { label: "🇪🇸 Espanhol", value: "espanhol" },
        { label: "🇫🇷 Francês", value: "francês" },
      ];

      idiomas.forEach(idioma => {
        const btnIdioma = document.createElement("button");
        btnIdioma.textContent = idioma.label;
        btnIdioma.style.cssText = `
          background: rgba(255, 255, 255, 0.1);
          color: #FFF;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          padding: 10px 16px;
          font-size: 13px;
          cursor: pointer;
          text-align: left;
        `;
        btnIdioma.onclick = () => {
          seletor.remove();
          const btnCaptura = document.getElementById("btn-captura");
          btnCaptura.style.borderColor = "var(--cor-amarelo)";
          btnCaptura.onclick = () => {
            btnCaptura.onclick = null;
            capturarETradzuir(video, wrapper, idioma.value);
          };
        };
        seletor.appendChild(btnIdioma);
      });

      wrapper.appendChild(seletor);
    }

    return;
  }

  // Fluxo simulado — sem câmera real
  if (acao === "digitalizar") {
    video.loop = false;
    video.src = "../assets/cadernoNaMesa.mp4";
    video.play();
  } else if (acao === "traduzir") {
    // resto do fluxo simulado
    video.loop = false;
    video.src = "../assets/videoFolhaIngles.mp4";
    video.play();

    const msg = document.createElement("div");
    msg.id = "msg-reconhecimento";
    msg.textContent = "Aguarde o reconhecimento do texto";
    document.querySelector(".camera-wrapper").appendChild(msg);

    video.onended = () => {
      msg.remove();
      video.style.display = "none";
      const img = document.createElement("img");
      img.id = "resultado-traducao";
      img.src = "../assets/traducao.png";
      document.querySelector(".camera-wrapper").appendChild(img);
    };
  } else if (acao === "copiar") {
    video.loop = false;
    video.src = "../assets/cadernoNaMesa.mp4";
    video.play();

    const msg = document.createElement("div");
    msg.id = "msg-reconhecimento";
    msg.textContent = "Aguarde o reconhecimento do texto";
    document.querySelector(".camera-wrapper").appendChild(msg);

    video.onended = () => {
      msg.remove();
      video.style.display = "none";

      const img = document.createElement("img");
      img.id = "resultado-copia";
      img.src = "../assets/caderno.jpeg";
      document.querySelector(".camera-wrapper").appendChild(img);

      const btnFechar = document.createElement("button");
      btnFechar.id = "btn-fechar-selecao";
      btnFechar.innerHTML = '<span class="material-icons">close</span>';
      btnFechar.onclick = voltarParaLoop;
      document.querySelector(".camera-wrapper").appendChild(btnFechar);

      const wrapper = document.querySelector(".camera-wrapper");
      const canvas = document.createElement("canvas");
      canvas.id = "canvas-selecao";
      canvas.width = wrapper.offsetWidth;
      canvas.height = wrapper.offsetHeight;
      wrapper.appendChild(canvas);

      let startX,
        startY,
        drawing = false;
      const ctx = canvas.getContext("2d");

      canvas.addEventListener("mousedown", (e) => {
        const rect = canvas.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
        drawing = true;
        document.getElementById("botoes-copia")?.remove();
      });

      canvas.addEventListener("mousemove", (e) => {
        if (!drawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(200, 255, 0, 0.25)";
        ctx.strokeStyle = "#C8FF00";
        ctx.lineWidth = 2;
        ctx.fillRect(startX, startY, x - startX, y - startY);
        ctx.strokeRect(startX, startY, x - startX, y - startY);
      });

      canvas.addEventListener("mouseup", (e) => {
        if (!drawing) return;
        drawing = false;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const w = Math.abs(x - startX);
        const h = Math.abs(y - startY);
        if (w > 10 && h > 10) {
          document.getElementById("botoes-copia")?.remove();
          const botoes = document.createElement("div");
          botoes.id = "botoes-copia";
          botoes.innerHTML = `
            <button onclick="copiarTexto('trecho')">Copiar trecho selecionado</button>
            <button onclick="copiarTexto('tudo')">Copiar tudo</button>
          `;
          document.querySelector(".camera-wrapper").appendChild(botoes);
        }
      });

      canvas.addEventListener("touchstart", (e) => {
        const rect = canvas.getBoundingClientRect();
        startX = e.touches[0].clientX - rect.left;
        startY = e.touches[0].clientY - rect.top;
        drawing = true;
        document.getElementById("botoes-copia")?.remove();
      });

      canvas.addEventListener(
        "touchmove",
        (e) => {
          e.preventDefault();
          if (!drawing) return;
          const rect = canvas.getBoundingClientRect();
          const x = e.touches[0].clientX - rect.left;
          const y = e.touches[0].clientY - rect.top;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "rgba(200, 255, 0, 0.25)";
          ctx.strokeStyle = "#C8FF00";
          ctx.lineWidth = 2;
          ctx.fillRect(startX, startY, x - startX, y - startY);
          ctx.strokeRect(startX, startY, x - startX, y - startY);
        },
        { passive: false },
      );

      canvas.addEventListener("touchend", (e) => {
        if (!drawing) return;
        drawing = false;
        const rect = canvas.getBoundingClientRect();
        const x = e.changedTouches[0].clientX - rect.left;
        const y = e.changedTouches[0].clientY - rect.top;
        const w = Math.abs(x - startX);
        const h = Math.abs(y - startY);
        if (w > 10 && h > 10) {
          document.getElementById("botoes-copia")?.remove();
          const botoes = document.createElement("div");
          botoes.id = "botoes-copia";
          botoes.innerHTML = `
            <button onclick="copiarTexto('trecho')">Copiar trecho selecionado</button>
            <button onclick="copiarTexto('tudo')">Copiar tudo</button>
          `;
          document.querySelector(".camera-wrapper").appendChild(botoes);
        }
      });
    };
  } else {
    video.loop = true;
    video.src = "../assets/loopmesa.mp4";
    video.play();
  }
}

function copiarTexto(tipo) {
  const texto =
    tipo === "tudo"
      ? "Texto completo do documento copiado."
      : "Trecho selecionado copiado.";
  navigator.clipboard.writeText(texto).catch(() => {});
  mostrarAviso(tipo === "tudo" ? "Tudo copiado!" : "Trecho copiado!");
}

function irParaFoto() {
  if (modoAtual === "digitalizar") {
    window.location.href = "./galeria.html?foto=0";
  } else if (modoAtual === "traduzir") {
    window.location.href = "./galeria.html?foto=1";
  } else {
    window.location.href = "./galeria.html";
  }
}
