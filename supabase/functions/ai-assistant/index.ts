import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, context, model } = await req.json()
    const apiKey = Deno.env.get('OPENROUTER_API_KEY')

    if (!apiKey) {
      throw new Error('API Key not found')
    }

    // Используем переданную модель или дефолтную
    const selectedModel = model || 'openai/gpt-oss-120b:free'

    console.log('🤖 Модель:', selectedModel)

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://questlog.app',
        'X-Title': 'QuestLog',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: 'system', content: 'Ты помощник QuestLog. Отвечай на русском.' },
          { role: 'user', content: `Контекст: ${JSON.stringify(context)}\n\nЗапрос: ${message}` }
        ],
        max_tokens: 800,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`OpenRouter ${response.status}: ${errText}`)
    }

    const data = await response.json()
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})