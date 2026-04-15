import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, code } = await req.json()

    if (!email || !code) {
      throw new Error('Email и code обязательны')
    }

    console.log('Отправка email на:', email, 'с кодом:', code)

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

    const data = await resend.emails.send({
      from: 'QuestLog <onboarding@resend.dev>',
      to: [email],
      subject: '🔐 Код подтверждения для QuestLog',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎮 QuestLog</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Код подтверждения</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="color: #374151; margin-bottom: 20px; font-size: 16px;">
              Ваш код подтверждения:
            </p>
            <div style="background: #f3f4f6; display: inline-block; padding: 20px 40px; border-radius: 8px; border: 2px dashed #3b82f6;">
              <span style="font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 4px;">${code}</span>
            </div>
            <p style="color: #6b7280; margin-top: 20px; font-size: 14px;">
              Код действителен в течение 10 минут
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>Если вы не запрашивали этот код, просто проигнорируйте письмо</p>
            <p style="margin-top: 10px;">© ${new Date().getFullYear()} QuestLog</p>
          </div>
        </div>
      `,
    })

    console.log('Email отправлен успешно:', data)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Email отправлен',
        data: data 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})