import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface Payload {
  nombre_jugador: string
  apellidos_jugador: string
  fecha_nacimiento: string
  nombre_representante: string
  telefono_representante: string
  email_representante?: string | null
  turno_preferido_dia?: string | null
  turno_preferido_hora?: string | null
  notas?: string | null
}

export async function POST(request: NextRequest) {
  try {
    const data: Payload = await request.json()
    const nombre = `${data.nombre_jugador} ${data.apellidos_jugador}`

    await resend.emails.send({
      from: 'G8 Entrenador <onboarding@resend.dev>',
      to: process.env.COACH_EMAIL!,
      subject: `🆕 Nueva inscripción: ${nombre}`,
      html: buildEmailHTML(data),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error enviando notificación:', err)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}

function row(label: string, value: string) {
  return `
    <div style="margin-bottom:16px;">
      <div style="color:rgba(241,240,236,0.55);font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">${label}</div>
      <div style="color:#ffffff;font-size:16px;font-weight:600;">${value}</div>
    </div>`
}

function buildEmailHTML(d: Payload): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:20px;background:#0a0a0a;font-family:-apple-system,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#1e1e70;border-radius:16px;overflow:hidden;">
    <div style="background:#ff8000;padding:24px 28px;">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;">🆕 Nueva Solicitud de Inscripción</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">G8 Entrenador · Academia de Fútbol</p>
    </div>
    <div style="padding:28px;">
      <p style="color:rgba(241,240,236,0.5);font-size:12px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 20px;font-weight:700;">Datos del jugador</p>
      ${row('Nombre', `${d.nombre_jugador} ${d.apellidos_jugador}`)}
      ${row('Fecha de nacimiento', d.fecha_nacimiento)}
      <div style="height:1px;background:rgba(255,255,255,0.1);margin:20px 0;"></div>
      <p style="color:rgba(241,240,236,0.5);font-size:12px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 20px;font-weight:700;">Datos del representante</p>
      ${row('Nombre', d.nombre_representante)}
      ${row('Teléfono', d.telefono_representante)}
      ${d.email_representante ? row('Email', d.email_representante) : ''}
      <div style="height:1px;background:rgba(255,255,255,0.1);margin:20px 0;"></div>
      <p style="color:rgba(241,240,236,0.5);font-size:12px;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 20px;font-weight:700;">Turno preferido</p>
      ${row('Día y hora', `${d.turno_preferido_dia ?? 'No indicado'} · ${d.turno_preferido_hora ?? 'No indicado'}`)}
      ${d.notas ? row('Notas', d.notas) : ''}
      <a href="https://elgochoentrenador.vercel.app" style="display:block;background:#ff8000;color:#fff;text-decoration:none;text-align:center;padding:14px 24px;border-radius:10px;font-weight:700;font-size:15px;margin-top:24px;">Ver en la app →</a>
    </div>
    <div style="padding:16px 28px;background:rgba(0,0,0,0.25);text-align:center;">
      <p style="margin:0;color:rgba(241,240,236,0.35);font-size:12px;">G8 Entrenador · Caracas, Venezuela</p>
    </div>
  </div>
</body></html>`
}
