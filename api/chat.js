export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { mensagens = [], contexto } = req.body;

  const contents = [];

  if (contexto) {
    contents.push({
      role: 'user',
      parts: [{ text: `Contexto para esta conversa (material de estudo do usuário):\n\n${contexto}` }],
    });
    contents.push({
      role: 'model',
      parts: [{ text: 'Entendido, estou pronta para ajudar com base nesse conteúdo.' }],
    });
  }

  mensagens.forEach((m) => {
    contents.push({
      role: m.autor === 'usuario' ? 'user' : 'model',
      parts: [{ text: m.texto }],
    });
  });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${process.env.GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [
            {
              text: 'Você é a JOVI, uma assistente de estudos amigável. Responda sempre em português, de forma clara, curta e didática, ajudando o usuário a estudar, tirar dúvidas e organizar o aprendizado. Pode usar markdown simples para formatar (negrito com **texto**, listas com "- " ou "1. ", separador com "---"). Nunca use LaTeX nem os símbolos $ ou $$ para fórmulas matemáticas: escreva fórmulas em texto simples, usando caracteres como ², ³, √, ±, Δ, × e subscritos como x1, x2 quando precisar representar expoentes ou índices.',
            },
          ],
        },
      }),
    },
  );

  const data = await response.json();

  if (data.error) {
    return res.status(500).json({ erro: data.error.message });
  }

  const partes = data.candidates?.[0]?.content?.parts || [];
  const texto = partes.map((p) => p.text || '').join('');

  if (!texto) {
    return res.status(500).json({ erro: 'A IA não retornou nenhuma resposta.' });
  }

  res.json({ texto: texto.trim() });
}
