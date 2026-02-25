module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { keyword, lang, region } = req.body;
  if (!keyword) return res.status(400).json({ error: 'Keyword is required' });

  const prompt = `Eres un experto en SEO. Analiza la keyword "${keyword}" para el mercado "${region || 'global'}" en idioma "${lang || 'es'}".

Devuelve SOLO un JSON valido con esta estructura exacta, sin markdown ni texto adicional:

{
  "main_keyword": {
    "keyword": "${keyword}",
    "difficulty": 45,
    "potential": 7,
    "intent": "informacional",
    "volume": "1000-10000",
    "best_content_type": "Blog post"
  },
  "semantic_analysis": "Descripcion breve del contexto y audiencia objetivo.",
  "lsi_terms": ["termino1", "termino2", "termino3", "termino4", "termino5", "termino6"],
  "keywords": [
    {"keyword": "keyword relacionada 1", "difficulty": 25, "intent": "informacional", "volume": "500-1K"},
    {"keyword": "keyword relacionada 2", "difficulty": 40, "intent": "transaccional", "volume": "1K-5K"},
    {"keyword": "keyword relacionada 3", "difficulty": 55, "intent": "comercial", "volume": "2K-8K"},
    {"keyword": "keyword relacionada 4", "difficulty": 20, "intent": "informacional", "volume": "200-500"},
    {"keyword": "keyword relacionada 5", "difficulty": 35, "intent": "transaccional", "volume": "800-2K"},
    {"keyword": "keyword relacionada 6", "difficulty": 60, "intent": "comercial", "volume": "3K-10K"},
    {"keyword": "keyword relacionada 7", "difficulty": 15, "intent": "informacional", "volume": "100-300"},
    {"keyword": "keyword relacionada 8", "difficulty": 45, "intent": "navegacional", "volume": "500-2K"},
    {"keyword": "keyword relacionada 9", "difficulty": 30, "intent": "informacional", "volume": "300-800"},
    {"keyword": "keyword relacionada 10", "difficulty": 50, "intent": "transaccional", "volume": "1K-4K"},
    {"keyword": "keyword relacionada 11", "difficulty": 25, "intent": "informacional", "volume": "400-1K"},
    {"keyword": "keyword relacionada 12", "difficulty": 70, "intent": "comercial", "volume": "5K-20K"},
    {"keyword": "keyword relacionada 13", "difficulty": 20, "intent": "informacional", "volume": "150-400"},
    {"keyword": "keyword relacionada 14", "difficulty": 40, "intent": "transaccional", "volume": "600-2K"},
    {"keyword": "keyword relacionada 15", "difficulty": 35, "intent": "informacional", "volume": "250-700"}
  ],
  "questions": [
    "Pregunta frecuente 1 sobre el tema",
    "Pregunta frecuente 2 sobre el tema",
    "Pregunta frecuente 3 sobre el tema",
    "Pregunta frecuente 4 sobre el tema",
    "Pregunta frecuente 5 sobre el tema"
  ],
  "content_ideas": [
    "Idea de contenido concreta y accionable 1",
    "Idea de contenido concreta y accionable 2",
    "Idea de contenido concreta y accionable 3",
    "Idea de contenido concreta y accionable 4"
  ],
  "serp_analysis": "Descripcion de que tipo de paginas rankean y como competir.",
  "competitors": [
    {"type": "Blogs especializados", "description": "Alta autoridad de dominio"},
    {"type": "E-commerce", "description": "Enfocados en conversion"},
    {"type": "Medios digitales", "description": "Contenido informativo masivo"}
  ]
}`;

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
      return res.status(response.status).json({ error: data.error?.message || 'Anthropic API error' });
    }

    const text = data.content?.map(c => c.text || '').join('') || '';

    let jsonStr = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const start = jsonStr.indexOf('{');
    const end = jsonStr.lastIndexOf('}');
    if (start !== -1 && end !== -1) jsonStr = jsonStr.slice(start, end + 1);
    jsonStr = jsonStr.replace(/,\s*([\]}])/g, '$1');

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      return res.status(200).json({ raw: jsonStr, parseError: e.message });
    }

    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
