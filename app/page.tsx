'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Menu, X, Target, Trophy, Shield, MapPin,
  MessageCircle, Check, Star,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

// ─── Constants ────────────────────────────────────────────────────────────────
const WA_BASE = 'https://wa.me/584120168219'
const WA_MSG = encodeURIComponent('Hola, me interesa información sobre G8 Entrenador')
const DIAS = ['Viernes', 'Sábado', 'Domingo'] as const
const HORAS = ['9:00am', '11:00am', '1:00pm'] as const
const MAX_CUPO = 6

type Dia = (typeof DIAS)[number]
type Hora = (typeof HORAS)[number]

interface S1 { nombreJugador: string; apellidosJugador: string; fechaNacimiento: string }
interface S2 { nombreRepresentante: string; telefonoRepresentante: string; emailRepresentante: string }
interface S3 { dia: Dia | ''; hora: Hora | ''; notas: string }

function InstagramIcon({ size = 18, color = '#ff8000' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill={color} stroke="none" />
    </svg>
  )
}

function TikTokIcon({ size = 18, color = '#ff8000' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.79 1.53V6.78a4.85 4.85 0 01-1.02-.09z" />
    </svg>
  )
}

export default function Home() {
  const formRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const [paso, setPaso] = useState(1)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [formError, setFormError] = useState('')
  const [cupos, setCupos] = useState<Record<string, number>>({})

  const [s1, setS1] = useState<S1>({ nombreJugador: '', apellidosJugador: '', fechaNacimiento: '' })
  const [s2, setS2] = useState<S2>({ nombreRepresentante: '', telefonoRepresentante: '+58 ', emailRepresentante: '' })
  const [s3, setS3] = useState<S3>({ dia: '', hora: '', notas: '' })

  useEffect(() => { loadCupos() }, [])

  async function loadCupos() {
    try {
      const { data } = await supabase.from('horarios').select('dia, hora')
      if (!data) return
      const counts: Record<string, number> = {}
      for (const h of data) {
        const k = `${h.dia}-${h.hora}`
        counts[k] = (counts[k] ?? 0) + 1
      }
      setCupos(counts)
    } catch { /* todos los cupos disponibles */ }
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  function validateS1(): string {
    if (!s1.nombreJugador.trim()) return 'Ingresa el nombre del jugador'
    if (!s1.apellidosJugador.trim()) return 'Ingresa los apellidos'
    if (!s1.fechaNacimiento) return 'Ingresa la fecha de nacimiento'
    return ''
  }

  function validateS2(): string {
    if (!s2.nombreRepresentante.trim()) return 'Ingresa tu nombre'
    if (!s2.telefonoRepresentante.trim() || s2.telefonoRepresentante === '+58 ') return 'Ingresa tu teléfono'
    return ''
  }

  async function handleEnviar() {
    if (!s3.dia) { setFormError('Selecciona un día'); return }
    if (!s3.hora) { setFormError('Selecciona un horario'); return }
    setFormError('')
    setEnviando(true)
    try {
      const payload = {
        nombre_jugador: s1.nombreJugador.trim(),
        apellidos_jugador: s1.apellidosJugador.trim(),
        fecha_nacimiento: s1.fechaNacimiento,
        nombre_representante: s2.nombreRepresentante.trim(),
        telefono_representante: s2.telefonoRepresentante.trim(),
        email_representante: s2.emailRepresentante.trim() || null,
        turno_preferido_dia: s3.dia,
        turno_preferido_hora: s3.hora,
        notas: s3.notas.trim() || null,
        estado: 'pendiente',
      }
      const { error } = await supabase.from('solicitudes_inscripcion').insert(payload)
      if (error) throw error
      await fetch('/api/notificar-inscripcion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setEnviado(true)
    } catch {
      setFormError('Error al enviar. Por favor intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  const cuposLibres = (dia: string, hora: string) => MAX_CUPO - (cupos[`${dia}-${hora}`] ?? 0)
  const input = "w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#ff8000] focus:ring-1 focus:ring-[#ff8000] transition text-sm"

  return (
    <div className="min-h-screen bg-black text-[#F1F0EC] overflow-x-hidden">

      {/* ── Floating WhatsApp ── */}
      <a
        href={`${WA_BASE}?text=${WA_MSG}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-5 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform"
        aria-label="WhatsApp"
      >
        <MessageCircle size={26} color="white" fill="white" />
      </a>

      {/* ── Mobile nav overlay ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#1e1e70] flex flex-col items-center justify-center gap-8">
          <button onClick={() => setMenuOpen(false)} className="absolute top-6 right-5 text-white/60 hover:text-white">
            <X size={28} />
          </button>
          {(['sobre', 'programas', 'logros', 'ubicacion'] as const).map((id) => {
            const labels: Record<string, string> = { sobre: 'Sobre el coach', programas: 'Programas', logros: 'Logros', ubicacion: 'Ubicación' }
            return (
              <button key={id} onClick={() => scrollTo(id)} className="text-2xl font-bold text-white hover:text-[#ff8000] transition">
                {labels[id]}
              </button>
            )
          })}
          <button onClick={scrollToForm} className="bg-[#ff8000] text-white font-bold text-xl px-8 py-4 rounded-2xl hover:bg-orange-600 transition">
            Inscribir a mi hijo
          </button>
        </div>
      )}

      {/* ══════════ SECCIÓN 1 — HERO ══════════ */}
      <section
        className="relative min-h-screen flex flex-col"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-[#1e1e70]/50 to-black/95" />

        <nav className="relative z-10 flex items-center justify-between px-5 pt-6 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="G8 Entrenador" className="w-10 h-10 object-contain" />
            <span className="text-white font-bold text-sm leading-tight hidden sm:block">
              El Gocho<br /><span className="text-[#ff8000]">Entrenador</span>
            </span>
          </div>
          <button onClick={() => setMenuOpen(true)} className="text-white/60 hover:text-white">
            <Menu size={26} />
          </button>
        </nav>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-5 py-16">
          <div className="max-w-3xl mx-auto">
            <span className="inline-block text-[#ff8000] text-xs font-bold tracking-widest uppercase mb-5 border border-[#ff8000]/30 px-4 py-1.5 rounded-full">
              Academia de fútbol · Caracas · 7 a 15 años
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight mb-5">
              Formando jugadores{' '}
              <span className="text-[#ff8000]">inteligentes,</span>
              <br />educando líderes{' '}
              <span className="text-[#ff8000]">conscientes</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/65 mb-10 max-w-xl mx-auto leading-relaxed">
              Academia de fútbol para niños de 7 a 15 años en Caracas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={scrollToForm}
                className="bg-[#ff8000] text-white font-bold text-lg px-8 py-4 rounded-2xl hover:bg-orange-600 active:scale-95 transition-all shadow-xl shadow-orange-500/20"
              >
                Inscribe a tu hijo →
              </button>
              <a
                href={`${WA_BASE}?text=${encodeURIComponent('Hola, quiero una clase de prueba gratis con G8 Entrenador')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-white/35 text-white font-semibold text-lg px-8 py-4 rounded-2xl hover:border-white hover:bg-white/10 active:scale-95 transition-all"
              >
                Clase de prueba gratis
              </a>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex justify-center pb-8">
          <div className="w-6 h-10 rounded-full border-2 border-white/25 flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/40 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ══════════ SECCIÓN 2 — TRUST STRIP ══════════ */}
      <section className="bg-[#1e1e70] py-14 px-5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '3', label: 'Años de experiencia' },
            { value: '120+', label: 'Niños formados' },
            { value: '4', label: 'Campeonatos ganados' },
            { value: '✓', label: 'Coach certificado' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-4xl md:text-5xl font-black text-[#ff8000]">{value}</p>
              <p className="text-sm text-[#F1F0EC]/65 mt-1.5 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ SECCIÓN 3 — SOBRE EL COACH ══════════ */}
      <section id="sobre" className="bg-black py-20 px-5">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-[#ff8000] shadow-2xl shadow-orange-500/20">
                <img
                  src="https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=600&q=80"
                  alt="Cristopher Martínez — El Gocho Entrenador"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-[#ff8000] rounded-2xl px-4 py-2.5 shadow-xl">
                <p className="text-white font-black text-sm">3 años</p>
                <p className="text-white/75 text-xs">de experiencia</p>
              </div>
            </div>
          </div>
          <div>
            <span className="text-[#ff8000] text-xs font-bold tracking-widest uppercase">Sobre el coach</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-2 mb-4">Cristopher Martínez</h2>
            <p className="text-[#F1F0EC]/70 text-base leading-relaxed mb-4">
              Con más de 3 años formando jugadores en Caracas, Cristopher ha entrenado a más de 120 niños entre los 7 y 15 años, ayudándolos a desarrollar no solo sus habilidades técnicas en el fútbol, sino también valores fundamentales como la disciplina, el compromiso y la resiliencia.
            </p>
            <p className="text-[#F1F0EC]/70 text-base leading-relaxed mb-6">
              Su metodología combina técnica futbolística con formación humana integral, creando jugadores conscientes de su potencial dentro y fuera de la cancha. Campeón sub-10 y sub-12 en la Liga Colegial 2025, El Gocho Entrenador es referencia en la academia juvenil de Caracas.
            </p>
            <a
              href={`${WA_BASE}?text=${WA_MSG}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#ff8000] text-white font-bold px-6 py-3.5 rounded-xl hover:bg-orange-600 active:scale-95 transition-all"
            >
              <MessageCircle size={18} /> Hablar con el coach
            </a>
          </div>
        </div>
      </section>

      {/* ══════════ SECCIÓN 4 — 3 PILARES ══════════ */}
      <section id="programas" className="bg-[#1e1e70] py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#ff8000] text-xs font-bold tracking-widest uppercase">Metodología</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-2">Nuestra metodología</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { Icon: Target, title: 'Resultados conscientes', desc: 'Entrenamos con objetivos claros y medibles. Cada sesión tiene un propósito: mejorar técnica, táctica y mentalidad para resultados reales.' },
              { Icon: Trophy, title: 'Técnica', desc: 'Fundamentos sólidos desde temprana edad. Control de balón, pase, regate y definición trabajados con método y progresión.' },
              { Icon: Shield, title: 'Disciplina y compromiso', desc: 'Los valores que forman líderes. Respeto, puntualidad y trabajo en equipo son parte del entrenamiento diario.' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="bg-black border border-[#ff8000]/25 rounded-2xl p-6 hover:border-[#ff8000]/60 transition-colors">
                <div className="w-14 h-14 bg-[#ff8000]/10 rounded-2xl flex items-center justify-center mb-4">
                  <Icon size={28} color="#ff8000" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-[#F1F0EC]/60 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ SECCIÓN 5 — PROGRAMAS Y PRECIOS ══════════ */}
      <section className="bg-black py-20 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#ff8000] text-xs font-bold tracking-widest uppercase">Precios</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-2">Nuestros programas</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="relative bg-[#1e1e70]/30 border-2 border-[#ff8000] rounded-2xl p-7">
              <div className="absolute -top-3.5 left-6 bg-[#ff8000] text-white text-xs font-black px-3 py-1 rounded-full tracking-wider uppercase">
                Más popular
              </div>
              <h3 className="text-white font-black text-2xl mt-2 mb-1">Entrenamiento Grupal</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-[#ff8000] text-5xl font-black">$40</span>
                <span className="text-white/40 text-sm ml-1">/ 5 clases</span>
              </div>
              <ul className="space-y-3 mb-7">
                {['Entrenamiento en cancha', 'Grupos pequeños (máx 6 jugadores)', 'Evaluación continua de rendimiento', 'Horarios Vie / Sáb / Dom'].map(b => (
                  <li key={b} className="flex items-start gap-3 text-sm text-[#F1F0EC]/80">
                    <Check size={16} className="text-[#ff8000] mt-0.5 flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <button onClick={scrollToForm} className="w-full bg-[#ff8000] text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 active:scale-95 transition-all">
                Inscribirme →
              </button>
            </div>
            <div className="bg-white/4 border border-white/15 rounded-2xl p-7">
              <h3 className="text-white font-black text-2xl mb-1">Entrenamiento Personalizado</h3>
              <div className="mb-6">
                <span className="text-[#ff8000] text-2xl font-black">Consultar precio</span>
              </div>
              <ul className="space-y-3 mb-7">
                {['Clases individuales', 'En tu espacio o el de tu familia', '1 hora de trabajo completa', 'Plan personalizado según objetivos'].map(b => (
                  <li key={b} className="flex items-start gap-3 text-sm text-[#F1F0EC]/80">
                    <Check size={16} className="text-white/35 mt-0.5 flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <a
                href={`${WA_BASE}?text=${encodeURIComponent('Hola, me interesa el entrenamiento personalizado de G8 Entrenador')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center border-2 border-white/30 text-white font-bold py-3.5 rounded-xl hover:border-white/60 hover:bg-white/5 transition"
              >
                Consultar por WhatsApp
              </a>
            </div>
          </div>
          <div className="text-center">
            <p className="text-[#F1F0EC]/40 text-sm">
              Métodos de pago:{' '}
              <span className="text-[#F1F0EC]/70 font-medium">Efectivo · Pagomóvil · Binance Pay · Transferencia · Bs</span>
            </p>
          </div>
        </div>
      </section>

      {/* ══════════ SECCIÓN 6 — LOGROS ══════════ */}
      <section id="logros" className="bg-[#1e1e70] py-20 px-5 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #ff8000 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />
        <div className="relative max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#ff8000] text-xs font-bold tracking-widest uppercase">Palmarés</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-2">Resultados que hablan</h2>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-4 bottom-4 w-px bg-[#ff8000]/25" />
            <div className="space-y-6">
              {[
                { year: '2025', emoji: '🏆', title: 'Campeón sub-10 Liga Colegial', champion: true },
                { year: '2025', emoji: '🏆', title: 'Campeón sub-12 Liga Colegial', champion: true },
                { year: '2024', emoji: '🥈', title: 'Subcampeón sub-10 Cesar del Vecchio', champion: false },
                { year: '2024', emoji: '🥈', title: 'Subcampeón sub-12 Liga Colegial', champion: false },
              ].map(({ year, emoji, title, champion }, i) => (
                <div key={i} className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 z-10 border-2 ${champion ? 'bg-[#ff8000] border-[#ff8000]' : 'bg-[#1e1e70] border-[#ff8000]/40'}`}>
                    {emoji}
                  </div>
                  <div className="bg-black/40 rounded-2xl px-5 py-4 flex-1">
                    <span className="text-[#ff8000] text-xs font-bold tracking-wider">{year}</span>
                    <p className="text-white font-bold text-base mt-0.5">{title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ SECCIÓN 7 — UBICACIÓN Y HORARIOS ══════════ */}
      <section id="ubicacion" className="bg-black py-20 px-5">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-start">
          <div className="rounded-2xl overflow-hidden border-2 border-[#ff8000]/30 shadow-2xl">
            <iframe
              src="https://maps.google.com/maps?q=Parque+Aristides+Rojas+Avenida+Andres+Bello+Caracas+Venezuela&output=embed&z=16"
              width="100%"
              height="320"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación G8 Entrenador"
            />
          </div>
          <div>
            <span className="text-[#ff8000] text-xs font-bold tracking-widest uppercase">Dónde entrenar</span>
            <h2 className="text-3xl md:text-4xl font-black text-white mt-2 mb-5">Ubicación y horarios</h2>
            <div className="flex items-start gap-3 mb-7">
              <MapPin size={20} className="text-[#ff8000] mt-0.5 flex-shrink-0" />
              <p className="text-[#F1F0EC]/70 text-sm leading-relaxed">
                Parque Arístides Rojas, Av. Andrés Bello,<br />
                frente a la Hermandad Gallega, Caracas
              </p>
            </div>
            <h3 className="text-white font-bold text-base mb-3">Horarios disponibles</h3>
            <div className="space-y-2.5">
              {DIAS.map(dia => (
                <div key={dia} className="bg-white/5 rounded-xl px-4 py-3">
                  <p className="text-[#ff8000] font-bold text-sm mb-2">{dia}</p>
                  <div className="flex gap-2 flex-wrap">
                    {HORAS.map(hora => (
                      <span key={hora} className="bg-[#ff8000]/15 text-[#ff8000] text-xs font-semibold px-3 py-1 rounded-full">
                        {hora}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[#F1F0EC]/35 text-xs mt-3">Máximo 6 jugadores por turno</p>
          </div>
        </div>
      </section>

      {/* ══════════ SECCIÓN 8 — TESTIMONIOS ══════════ */}
      <section className="bg-[#1e1e70] py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#ff8000] text-xs font-bold tracking-widest uppercase">Familias G8</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-2">Lo que dicen las familias</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {(['JR', 'MC', 'AP'] as const).map((initials, i) => (
              <div key={i} className="bg-black/35 border border-white/8 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#ff8000]/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#ff8000] font-bold text-sm">{initials}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={13} className="text-[#ff8000]" fill="#ff8000" />
                    ))}
                  </div>
                </div>
                <p className="text-[#F1F0EC]/35 text-sm italic leading-relaxed">
                  Próximamente testimonios reales de familias G8
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ SECCIÓN 9 — FORMULARIO ══════════ */}
      <div ref={formRef} id="inscripcion" className="bg-black py-20 px-5">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <span className="text-[#ff8000] text-xs font-bold tracking-widest uppercase">Únete al equipo</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-2 leading-tight">
              ¿Listo para que tu hijo entrene con G8?
            </h2>
            <p className="text-[#F1F0EC]/55 text-base mt-3">
              Completa el formulario y te contactamos en 24 horas
            </p>
          </div>

          {enviado ? (
            <div className="bg-[#1e1e70]/40 border border-[#ff8000]/30 rounded-3xl p-10 text-center">
              <div className="w-20 h-20 bg-[#ff8000]/15 rounded-full flex items-center justify-center mx-auto mb-5">
                <Check size={38} className="text-[#ff8000]" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">¡Recibimos tu solicitud!</h3>
              <p className="text-[#F1F0EC]/65 mb-8 leading-relaxed">
                Te contactaremos en las próximas 24 horas por WhatsApp para confirmar tu cupo.
              </p>
              <a
                href={`${WA_BASE}?text=${WA_MSG}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-6 py-3.5 rounded-xl hover:bg-green-600 transition"
              >
                <MessageCircle size={18} /> Escribir al coach
              </a>
            </div>
          ) : (
            <div className="bg-white/4 border border-white/10 rounded-3xl p-6 md:p-8">
              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[#ff8000] text-sm font-bold">Paso {paso} de 3</span>
                  <span className="text-white/35 text-xs font-medium">
                    {paso === 1 ? 'Datos del jugador' : paso === 2 ? 'Datos del representante' : 'Horario preferido'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full bg-[#ff8000] rounded-full transition-all duration-500" style={{ width: `${(paso / 3) * 100}%` }} />
                </div>
              </div>

              {formError && (
                <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
                  {formError}
                </div>
              )}

              {/* PASO 1 */}
              {paso === 1 && (
                <div className="space-y-4">
                  <h3 className="text-white font-bold text-lg mb-1">Sobre el jugador</h3>
                  <div>
                    <label className="block text-white/50 text-xs font-semibold mb-1.5 uppercase tracking-wider">Nombre *</label>
                    <input type="text" value={s1.nombreJugador} onChange={e => setS1({ ...s1, nombreJugador: e.target.value })} placeholder="Ej: Carlos" className={input} />
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs font-semibold mb-1.5 uppercase tracking-wider">Apellidos *</label>
                    <input type="text" value={s1.apellidosJugador} onChange={e => setS1({ ...s1, apellidosJugador: e.target.value })} placeholder="Ej: Rodríguez Pérez" className={input} />
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs font-semibold mb-1.5 uppercase tracking-wider">Fecha de nacimiento *</label>
                    <input type="date" value={s1.fechaNacimiento} onChange={e => setS1({ ...s1, fechaNacimiento: e.target.value })} className={input} style={{ colorScheme: 'dark' }} />
                  </div>
                  <button
                    onClick={() => { const err = validateS1(); if (err) { setFormError(err); return } setFormError(''); setPaso(2) }}
                    className="w-full bg-[#ff8000] text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 active:scale-95 transition-all mt-2"
                  >
                    Siguiente →
                  </button>
                </div>
              )}

              {/* PASO 2 */}
              {paso === 2 && (
                <div className="space-y-4">
                  <h3 className="text-white font-bold text-lg mb-1">Sobre ti</h3>
                  <div>
                    <label className="block text-white/50 text-xs font-semibold mb-1.5 uppercase tracking-wider">Tu nombre completo *</label>
                    <input type="text" value={s2.nombreRepresentante} onChange={e => setS2({ ...s2, nombreRepresentante: e.target.value })} placeholder="Ej: María González" className={input} />
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs font-semibold mb-1.5 uppercase tracking-wider">Teléfono *</label>
                    <input type="tel" value={s2.telefonoRepresentante} onChange={e => setS2({ ...s2, telefonoRepresentante: e.target.value })} placeholder="+58 414 123 4567" className={input} />
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs font-semibold mb-1.5 uppercase tracking-wider">
                      Email <span className="text-white/25 normal-case">(opcional)</span>
                    </label>
                    <input type="email" value={s2.emailRepresentante} onChange={e => setS2({ ...s2, emailRepresentante: e.target.value })} placeholder="ejemplo@correo.com" className={input} />
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button onClick={() => { setFormError(''); setPaso(1) }} className="flex-1 border border-white/15 text-white/60 font-semibold py-3.5 rounded-xl hover:border-white/30 hover:text-white transition">
                      ← Atrás
                    </button>
                    <button
                      onClick={() => { const err = validateS2(); if (err) { setFormError(err); return } setFormError(''); setPaso(3) }}
                      className="flex-[2] bg-[#ff8000] text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 active:scale-95 transition-all"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 3 */}
              {paso === 3 && (
                <div className="space-y-5">
                  <h3 className="text-white font-bold text-lg mb-1">Horario preferido</h3>
                  <div>
                    <label className="block text-white/50 text-xs font-semibold mb-2 uppercase tracking-wider">Día</label>
                    <div className="grid grid-cols-3 gap-2">
                      {DIAS.map(dia => (
                        <button
                          key={dia}
                          type="button"
                          onClick={() => setS3({ ...s3, dia, hora: '' })}
                          className={`py-3 rounded-xl text-sm font-bold transition-all ${
                            s3.dia === dia
                              ? 'bg-[#ff8000] text-white'
                              : 'bg-white/5 border border-white/15 text-white/60 hover:border-[#ff8000]/40 hover:text-white'
                          }`}
                        >
                          {dia}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs font-semibold mb-2 uppercase tracking-wider">Horario</label>
                    <div className="grid grid-cols-3 gap-2">
                      {HORAS.map(hora => {
                        const libres = s3.dia ? cuposLibres(s3.dia, hora) : MAX_CUPO
                        const lleno = libres <= 0
                        return (
                          <button
                            key={hora}
                            type="button"
                            disabled={lleno}
                            onClick={() => !lleno && setS3({ ...s3, hora })}
                            className={`py-3 rounded-xl text-sm font-bold transition-all flex flex-col items-center gap-0.5 ${
                              s3.hora === hora
                                ? 'bg-[#ff8000] text-white'
                                : lleno
                                  ? 'bg-white/3 border border-white/8 text-white/20 cursor-not-allowed'
                                  : 'bg-white/5 border border-white/15 text-white/60 hover:border-[#ff8000]/40 hover:text-white'
                            }`}
                          >
                            <span>{hora}</span>
                            {s3.dia && (
                              <span className={`text-[10px] font-medium leading-none ${s3.hora === hora ? 'text-white/70' : lleno ? 'text-red-400' : 'text-white/30'}`}>
                                {lleno ? 'Lleno' : `${libres} cupo${libres !== 1 ? 's' : ''}`}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs font-semibold mb-2 uppercase tracking-wider">
                      Mensaje adicional <span className="text-white/25 normal-case">(opcional)</span>
                    </label>
                    <textarea
                      value={s3.notas}
                      onChange={e => setS3({ ...s3, notas: e.target.value })}
                      placeholder="Ej: Mi hijo tiene experiencia previa, le interesa el puesto de portero..."
                      rows={3}
                      className={`${input} resize-none`}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setFormError(''); setPaso(2) }} className="flex-1 border border-white/15 text-white/60 font-semibold py-3.5 rounded-xl hover:border-white/30 hover:text-white transition">
                      ← Atrás
                    </button>
                    <button
                      onClick={handleEnviar}
                      disabled={enviando}
                      className="flex-[2] bg-[#ff8000] text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {enviando ? 'Enviando...' : 'Enviar solicitud →'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ══════════ SECCIÓN 10 — FOOTER ══════════ */}
      <footer className="bg-[#0e0e4a] py-12 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="G8 Entrenador" className="w-12 h-12 object-contain" />
              <div>
                <p className="text-white font-black text-lg leading-tight">El Gocho Entrenador</p>
                <p className="text-white/35 text-xs mt-0.5">Academia de fútbol · Caracas</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href="https://www.instagram.com/elgochoentrenador" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/8 rounded-xl flex items-center justify-center hover:bg-[#ff8000]/20 transition" aria-label="Instagram">
                <InstagramIcon size={18} />
              </a>
              <a href="https://www.tiktok.com/@elgochoentrenador" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/8 rounded-xl flex items-center justify-center hover:bg-[#ff8000]/20 transition" aria-label="TikTok">
                <TikTokIcon size={18} />
              </a>
              <a href={`${WA_BASE}?text=${WA_MSG}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#25D366]/15 rounded-xl flex items-center justify-center hover:bg-[#25D366]/30 transition" aria-label="WhatsApp">
                <MessageCircle size={18} color="#25D366" />
              </a>
            </div>
          </div>
          <div className="border-t border-white/8 pt-6 text-center">
            <p className="text-white/25 text-sm">© 2026 El Gocho Entrenador · Caracas, Venezuela</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
