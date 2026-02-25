exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'API key no configurada' }) };
  }

  let keyword, lang, region;
  try {
    const body = JSON.parse(event.body);
    keyword = body.keyword;
    lang = body.lang || 'es';
    region = body.region || 'global';
  } catch(e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Body inválido' }) };
  }

  if (!keyword) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Keyword requerida' }) };
  }

  const prompt = `Eres un experto en SEO. Analiza la keyword "${keyword}" para el mercado "${region}" en idioma "${lang}". Devuelve SOLO JSON valido sin markdown con esta estructura exacta:
{"main_keyword":{"keyword":"${keyword}","difficulty":45,"potential":7,"intent":"informacional","volume":"1000-10000","best_content_type":"Blog post"},"semantic_analysis":"Descripcion breve del contexto y audiencia objetivo para esta keyword.","lsi_terms":["termino1","termino2","termino3","termino4","termino5","termino6"],"keywords":[{"keyword":"kw relacionada 1","difficulty":25,"intent":"informacional","volume":"500-1K"},{"keyword":"kw relacionada 2","difficulty":40,"intent":"transaccional","volume":"1K-5K"},{"keyword":"kw relacionada 3","difficulty":30,"intent":"informacional","volume":"300-800"},{"keyword":"kw relacionada 4","difficulty":55,"intent":"comercial","volume":"2K-8K"},{"keyword":"kw relacionada 5","difficulty":20,"intent":"informacional","volume":"200-500"},{"keyword":"kw relacionada 6","difficulty":60,"intent":"comercial","volume":"3K-10K"},{"keyword":"kw relacionada 7","difficulty":15,"intent":"informacional","volume":"100-300"},{"keyword":"kw relacionada 8","difficulty":45,"intent":"navegacional","volume":"500-2K"},{"keyword":"kw relacionada 9","difficulty":30,"intent":"informacional","volume":"300-800"},{"keyword":"kw relacionada 10","difficulty":50,"intent":"transaccional","volume":"1K-4K"},{"keyword":"kw relacionada 11","difficulty":25,"intent":"informacional","volume":"400-1K"},{"keyword":"kw relacionada 12","difficulty":70,"intent":"comercial","volume":"5K-20K"},{"keyword":"kw relacionada 13","difficulty":20,"intent":"informacional","volume":"150-400"},{"keyword":"kw relacionada 14","difficulty":40,"intent":"transaccional","volume":"600-2K"},{"keyword":"kw relacionada 15","difficulty":35,"intent":"informacional","volume":"250-700"}],"questions":["Pregunta 1 relevante","Pregunta 2 relevante","Pregunta 3 relevante","Pregunta 4 relevante","Pregunta 5 relevante"],"content_ideas":["Idea concreta 1","Idea concreta 2","Idea concreta 3","Idea concreta 4"],"serp_analysis":"Descripcion de competidores y estrategia para posicionar.","competitors":[{"type":"Blogs especializados","description":"Alta autoridad de dominio"},{"type":"E-commerce","description":"Enfocados en conversion"},{"type":"Medios digitales","description":"Contenido informativo masivo"}]}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: data.error?.message || 'Anthropic API error', type: data.error?.type })
      };
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
    } catch(e) {
      return { statusCode: 200, headers, body: JSON.stringify({ raw: jsonStr, parseError: e.message }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify(parsed) };

  } catch(err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
