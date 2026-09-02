export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { imageBase64, modo } = req.body;

  const prompt = modo === 'traduzir'
    ? 'Extraia e traduza para português todo o texto visível nesta imagem. Retorne apenas o texto traduzido, sem explicações.'
    : 'Extraia todo o texto visível nesta imagem. Retorne apenas o texto puro, sem formatação, sem JSON, sem explicações.';

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${process.env.GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: 'image/png', data: imageBase64 } },
            { text: prompt }
          ]
        }]
      })
    }
  );

  const data = await response.json();

  if (data.error) {
    return res.status(500).json({ erro: data.error.message });
  }

  res.json({ texto: data.candidates[0].content.parts[0].text.trim() });
}