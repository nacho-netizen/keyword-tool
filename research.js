export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers so the frontend can call this endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { keyword, lang, region } = req.body;

  if (!keyword) {
    return res.status(400).json({ error: 'Keyword is required' });
  }

  const prompt = `Eres un experto en SEO. Analiza la keyword "${keyword}" para el mercado "${region || 'global'}" en idioma "${lang || 'es'}".

Devuelve SOLO un JSON valido con esta estructura (sin markdown, sin texto adicional, sin caracteres especiales en los strings):

{
  "main_keyword": {
    "keyword": "${keyword}",
    "difficulty": 45,
    "potential": 7,
    "intent": "informacional",
    "volume": "1.000-10.000",
    "best_content_type": "Blog post"
  },
  "semantic_analysis": "Descripcion breve del contexto y audiencia en una sola linea sin comillas internas.",
  "lsi_terms": ["termino1", "termino2", "termino3", "termino4", "termino5", "termino6"],
  "keywords": [
    {"keyword": "ejemplo keyword 1", "difficulty": 25, "intent": "informacional", "volume": "500-1K"},
    {"keyword": "ejemplo keyword 2", "difficulty": 45, "intent": "transaccional", "volume": "1K-5K"}
  ],
  "questions": [
    "Pregunta frecuente de usuarios 1",
    "Pregunta frecuente de usuarios 2",
    "Pregunta frecuente de usuarios 3",
    "Pregunta frecuente de usuarios 4",
    "Pregunta frecuente de usuarios 5"
  ],
  "content_ideas": [
    "Idea de contenido concreta 1",
    "Idea de contenido concreta 2",
    "Idea de contenido concreta 3",
    "Idea de contenido concreta 4"
  ],
  "serp_analysis": "Descripcion de competidores y estrategia en una sola linea.",
  "competitors": [
    {"type": "Blogs especializados", "description": "Alta autoridad de dominio"},
    {"type": "E-commerce", "description": "Enfocados en conversion"},
    {"type": "Medios digitales", "description": "Contenido informativo masivo"}
  ]
}

Incluye exactamente 15 keywords relacionadas. No uses comillas dentro de los valores de texto. Usa solo caracteres ASCII simples en los strings de texto libre.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'API error' });
    }

    const text = data.content?.map(c => c.text || '').join('') || '';

    // Clean and parse JSON
    let jsonStr = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const start = jsonStr.indexOf('{');
    const end = jsonStr.lastIndexOf('}');
    if (start !== -1 && end !== -1) jsonStr = jsonStr.slice(start, end + 1);
    jsonStr = jsonStr.replace(/,\s*([\]}])/g, '$1');

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      // Return raw text so frontend can try partial extraction
      return res.status(200).json({ raw: jsonStr, parseError: e.message });
    }

    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
