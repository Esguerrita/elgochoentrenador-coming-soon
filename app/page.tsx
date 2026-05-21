'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  Menu, X, Target, Shield, MapPin,
  MessageCircle, Check, Star, UserPlus,
  Send, CircleDot, Zap, Goal, Eye,
  Brain, Heart, Activity, Users,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PAISES, VE_IDX } from '@/data/paises'

// ─── Constants ────────────────────────────────────────────────────────────────
const WA_BASE = 'https://wa.me/584120168219'
const WA_MSG = encodeURIComponent('Hola, me interesan las clases personalizadas con El Gocho Entrenador')
const WA_PRUEBA = encodeURIComponent('Hola, quiero agendar una clase de prueba gratis para mi hijo')
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

// ─── Animated counter ────────────────────────────────────────────────────────
function AnimatedCounter({ value, duration = 2000, suffix = '' }: { value: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const hasRun = useRef(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasRun.current) {
        hasRun.current = true
        observer.disconnect()
        const startTime = performance.now()
        const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
        const tick = (now: number) => {
          const t = Math.min((now - startTime) / duration, 1)
          setCount(Math.round(easeOut(t) * value))
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [value, duration])

  return <span ref={ref}>{count}{count >= value ? suffix : ''}</span>
}

// ─── Fade-in when visible ─────────────────────────────────────────────────────
function FadeInWhenVisible({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect() }
    }, { threshold: 0.3 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} style={{ transition: 'opacity 0.9s ease-out', opacity: visible ? 1 : 0 }}>
      {children}
    </div>
  )
}

// ─── Exit-intent modal ───────────────────────────────────────────────────────
function ExitPopup({ onClose }: { onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-focus first interactive element
    modalRef.current?.querySelector<HTMLElement>('a, button')?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function trapFocus(e: React.KeyboardEvent) {
    if (e.key !== 'Tab') return
    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    if (!focusable || focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus() }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.72)' }}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-title"
        className="relative w-full max-w-[420px] bg-[#1e1e70] border border-[#ff8000]/30 rounded-3xl p-8 shadow-2xl"
        style={{
          animation: 'exitPopupIn 250ms ease-out forwards',
        }}
        onClick={e => e.stopPropagation()}
        onKeyDown={trapFocus}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition"
          aria-label="Cerrar"
        >
          <X size={22} />
        </button>

        {/* Content */}
        <p className="text-3xl mb-3">👋</p>
        <h2 id="exit-title" className="text-2xl font-black text-white mb-2">¡Espera!</h2>
        <p className="text-[#ff8000] font-bold text-base mb-4">
          Agenda una clase de prueba <span className="underline underline-offset-2">GRATIS</span> para tu hijo
        </p>
        <p className="text-[#F1F0EC]/65 text-sm leading-relaxed mb-7">
          Descubre por qué más de 120 familias confían en El Gocho Entrenador. Sin compromiso, sin costo.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href={`${WA_BASE}?text=${WA_PRUEBA}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 bg-[#ff8000] text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 active:scale-95 transition-all"
          >
            <MessageCircle size={18} />
            Agendar clase gratis
          </a>
          <button
            onClick={onClose}
            className="w-full border border-white/20 text-white/60 font-semibold py-3 rounded-xl hover:border-white/40 hover:text-white transition text-sm"
          >
            No, gracias
          </button>
        </div>
      </div>

      <style>{`
        @keyframes exitPopupIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const formRef = useRef<HTMLDivElement>(null)
  const formTouchedRef = useRef(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showFloating, setShowFloating] = useState(false)
  const [showExitPopup, setShowExitPopup] = useState(false)

  const [fundamentoIdx, setFundamentoIdx] = useState(0)
  const [paso, setPaso] = useState(1)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [formError, setFormError] = useState('')
  const [turnoInfo, setTurnoInfo] = useState('')
  const [cupos, setCupos] = useState<Record<string, number>>({})

  const [s1, setS1] = useState<S1>({ nombreJugador: '', apellidosJugador: '', fechaNacimiento: '' })
  const [s2, setS2] = useState<S2>({ nombreRepresentante: '', telefonoRepresentante: '', emailRepresentante: '' })
  const [paisIdx, setPaisIdx] = useState(VE_IDX)
  const [numeroTel, setNumeroTel] = useState('')
  const [s3, setS3] = useState<S3>({ dia: '', hora: '', notas: '' })

  useEffect(() => { loadCupos() }, [])

  // ── Floating CTA visibility on scroll ──
  useEffect(() => {
    const onScroll = () => setShowFloating(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Exit-intent logic ──
  useEffect(() => {
    if (sessionStorage.getItem('exitShown')) return

    const fire = () => {
      if (sessionStorage.getItem('exitShown')) return
      sessionStorage.setItem('exitShown', '1')
      setShowExitPopup(true)
    }

    const isMobile = typeof window !== 'undefined' && ('ontouchstart' in window || window.innerWidth < 768)

    if (!isMobile) {
      const onMouseLeave = (e: MouseEvent) => { if (e.clientY < 10) fire() }
      document.addEventListener('mouseleave', onMouseLeave)
      return () => document.removeEventListener('mouseleave', onMouseLeave)
    } else {
      const timer = setTimeout(() => {
        const scrollPct = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight
        if (scrollPct >= 0.6 && !formTouchedRef.current) fire()
      }, 45000)
      return () => clearTimeout(timer)
    }
  }, [])

  async function loadCupos() {
    try {
      const { data } = await supabase
        .from('horarios')
        .select('dia, hora, jugadores!inner(activo)')
        .eq('jugadores.activo', true)
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
    if (!numeroTel.trim()) return 'Ingresa tu teléfono'
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
        telefono_representante: `${PAISES[paisIdx].codigo} ${numeroTel.trim()}`,
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

      {/* ── Floating buttons ── */}
      <div className="fixed bottom-6 right-5 z-50 flex items-center gap-3">
        {/* CTA Inscribir — aparece tras scroll 400px */}
        <button
          onClick={scrollToForm}
          aria-label="Ir al formulario de inscripción"
          style={{
            opacity: showFloating ? 1 : 0,
            pointerEvents: showFloating ? 'auto' : 'none',
            transition: 'opacity 300ms ease, transform 300ms ease',
            boxShadow: '0 0 20px rgba(255,128,0,0.4), 0 8px 24px rgba(0,0,0,0.4)',
          }}
          className="w-14 h-14 bg-[#ff8000] rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        >
          <UserPlus size={24} color="white" />
        </button>

        {/* WhatsApp */}
        <a
          href={`${WA_BASE}?text=${WA_MSG}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform"
          aria-label="WhatsApp"
        >
          <MessageCircle size={26} color="white" fill="white" />
        </a>
      </div>

      {/* ── Exit-intent popup ── */}
      {showExitPopup && <ExitPopup onClose={() => setShowExitPopup(false)} />}

      {/* ── Mobile nav overlay ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#1e1e70] flex flex-col items-center justify-center gap-5 overflow-y-auto py-12">
          <button onClick={() => setMenuOpen(false)} className="absolute top-6 right-5 text-white/60 hover:text-white" aria-label="Cerrar menú">
            <X size={28} />
          </button>
          {(['sobre', 'fundamentos', 'sesion', 'etapas', 'programas', 'logros', 'ubicacion'] as const).map((id) => {
            const labels: Record<string, string> = {
              sobre: 'Sobre el coach',
              fundamentos: 'Fundamentos',
              sesion: 'La sesión',
              etapas: 'Etapas',
              programas: 'Programas',
              logros: 'Logros',
              ubicacion: 'Ubicación',
            }
            return (
              <button key={id} onClick={() => scrollTo(id)} className="text-xl font-bold text-white hover:text-[#ff8000] transition">
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
      <section className="relative overflow-hidden bg-black">
        {/* Radial gradient background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 15% 20%, rgba(255,128,0,0.12), transparent 45%), radial-gradient(circle at 85% 80%, rgba(30,30,112,0.55), transparent 55%), #050514',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #ff8000 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <nav className="relative z-10 flex items-center justify-between px-5 pt-6 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="El Gocho Entrenador" width={40} height={40} className="object-contain" priority />
            <span className="text-white font-bold text-sm leading-tight">
              El Gocho<span className="text-[#ff8000]">.</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-white/70">
            <button onClick={() => scrollTo('sobre')} className="hover:text-white transition">Inicio</button>
            <button onClick={() => scrollTo('fundamentos')} className="hover:text-white transition">Fundamentos</button>
            <button onClick={() => scrollTo('sesion')} className="hover:text-white transition">La Sesión</button>
            <button onClick={() => scrollTo('etapas')} className="hover:text-white transition">Etapas</button>
            <button onClick={() => scrollTo('programas')} className="hover:text-white transition">Planes</button>
            <a
              href="https://www.instagram.com/elgochoentrenador"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#15154a] hover:bg-[#1e1e70] border border-white/10 text-white font-semibold px-5 py-2 rounded-full transition"
            >
              Seguir
            </a>
          </div>
          <button onClick={() => setMenuOpen(true)} className="md:hidden text-white/70 hover:text-white" aria-label="Abrir menú">
            <Menu size={26} />
          </button>
        </nav>

        <div className="relative z-10 max-w-6xl mx-auto px-5 pt-14 pb-20 md:pt-20 md:pb-28">
          <div className="grid md:grid-cols-2 gap-12 md:gap-10 items-center">
            {/* Texto */}
            <div>
              <span className="inline-flex items-center gap-2 text-[#ff8000] text-xs font-bold tracking-widest uppercase border border-[#ff8000]/40 px-4 py-1.5 rounded-full bg-[#ff8000]/5">
                <span aria-hidden>⚽</span> Formación · 7 a 15 años
              </span>
              <h1 className="text-5xl sm:text-6xl md:text-[64px] font-black text-white leading-[1.05] mt-6">
                Entrenamiento<br />
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(135deg, #ffb060 0%, #ff8000 60%, #c25a00 100%)' }}
                >
                  con propósito.
                </span>
              </h1>
              <p className="text-base md:text-lg text-white/60 mt-6 leading-relaxed max-w-md">
                Entrena como los futbolistas que quieren destacar. Lleva tu juego al siguiente nivel con entrenamientos especializados que combinan técnica, táctica y formación humana en cada acción dentro del campo.
              </p>
              <div className="flex items-center gap-2 mt-6 text-white/55 text-sm">
                <MapPin size={16} className="text-[#ff8000] flex-shrink-0" />
                Parque Arístides Rojas, Av. Andrés Bello, Caracas
              </div>
              <div className="flex flex-wrap gap-3 mt-8">
                <button
                  onClick={scrollToForm}
                  className="bg-[#ff8000] text-white font-bold px-6 py-3 rounded-full hover:bg-orange-600 active:scale-95 transition-all shadow-lg shadow-orange-500/20"
                >
                  Ver Planes y Precios
                </button>
                <button
                  onClick={() => scrollTo('fundamentos')}
                  className="bg-[#15154a] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#1e1e70] active:scale-95 transition-all border border-white/10"
                >
                  Conocer Metodología →
                </button>
              </div>
            </div>

            {/* Photo card */}
            <div className="relative">
              <div
                className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
                style={{ boxShadow: '0 30px 80px -20px rgba(255,128,0,0.15), 0 0 0 1px rgba(255,255,255,0.05)' }}
              >
                <Image
                  src="/coach.png"
                  alt="Cristopher Martínez — El Gocho Entrenador"
                  fill
                  priority
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div
                  className="absolute inset-x-0 bottom-0 p-6 pt-20"
                  style={{ background: 'linear-gradient(to top, rgba(5,5,20,0.95) 35%, transparent)' }}
                >
                  <p className="text-[#ff8000] text-[10px] font-black tracking-[0.2em] uppercase mb-3">
                    Coach Principal
                  </p>
                  <div className="flex items-center gap-2 text-white">
                    <span className="w-5 h-5 rounded-full bg-[#ff8000]/20 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-[#ff8000]" />
                    </span>
                    <p className="font-bold text-base">Cristopher Martínez</p>
                  </div>
                  <p className="text-white/50 text-xs mt-1.5 ml-7">Campeón Liga Colegial 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ SECCIÓN 2 — TRUST STRIP ══════════ */}
      <section className="relative bg-black border-y border-white/5 py-10 px-5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {([
            { num: 3,   suffix: '',  label: 'Años de experiencia' },
            { num: 120, suffix: '+', label: 'Niños formados' },
            { num: 4,   suffix: '',  label: 'Campeonatos ganados' },
          ] as const).map(({ num, suffix, label }) => (
            <div key={label}>
              <p className="text-3xl md:text-4xl font-black text-[#ff8000]">
                <AnimatedCounter value={num} suffix={suffix} />
              </p>
              <p className="text-xs md:text-sm text-white/55 mt-1.5 font-medium">{label}</p>
            </div>
          ))}
          <FadeInWhenVisible>
            <p className="text-3xl md:text-4xl font-black text-[#ff8000]">✓</p>
            <p className="text-xs md:text-sm text-white/55 mt-1.5 font-medium">Coach certificado</p>
          </FadeInWhenVisible>
        </div>
      </section>

      {/* ══════════ SECCIÓN 3 — SOBRE EL COACH ══════════ */}
      <section id="sobre" className="relative bg-black py-24 px-5 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            background:
              'radial-gradient(circle at 20% 50%, rgba(30,30,112,0.4), transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,128,0,0.05), transparent 50%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="flex justify-center">
            <div className="relative">
              <div
                className="relative aspect-[4/5] w-72 md:w-80 rounded-3xl overflow-hidden border border-white/10"
                style={{ boxShadow: '0 30px 80px -20px rgba(255,128,0,0.15)' }}
              >
                <Image
                  src="/coach.png"
                  alt="Cristopher Martínez — El Gocho Entrenador"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 288px, 320px"
                />
              </div>
              <div className="absolute -bottom-3 -right-3 bg-[#ff8000] rounded-2xl px-4 py-2.5 shadow-xl">
                <p className="text-white font-black text-sm">3 años</p>
                <p className="text-white/75 text-xs">de experiencia</p>
              </div>
            </div>
          </div>
          <div>
            <span className="inline-block text-[#ff8000] text-[10px] font-black tracking-[0.2em] uppercase border border-[#ff8000]/40 px-3 py-1 rounded-full bg-[#ff8000]/5 mb-4">
              Sobre el coach
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-[1.05]">
              Cristopher{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #ffb060, #ff8000)' }}
              >
                Martínez.
              </span>
            </h2>
            <p className="text-white/65 text-base leading-relaxed mb-4">
              Con más de 3 años formando jugadores en Caracas, Cristopher ha entrenado a más de 120 niños entre 7 y 15 años, ayudándolos a desarrollar no solo habilidades técnicas en el fútbol, sino también disciplina, compromiso y resiliencia.
            </p>
            <p className="text-white/65 text-base leading-relaxed mb-7">
              Su metodología combina técnica con formación humana integral, creando jugadores conscientes de su potencial dentro y fuera de la cancha. Campeón sub-10 y sub-12 en la Liga Colegial 2025.
            </p>
            <a
              href={`${WA_BASE}?text=${WA_MSG}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#ff8000] text-white font-bold px-6 py-3 rounded-full hover:bg-orange-600 active:scale-95 transition-all shadow-lg shadow-orange-500/20"
            >
              <MessageCircle size={18} /> Hablar con el coach
            </a>
          </div>
        </div>
      </section>

      {/* ══════════ SECCIÓN 4 — FUNDAMENTOS TÉCNICOS ══════════ */}
      <section
        id="fundamentos"
        className="relative bg-black py-24 px-5 overflow-hidden"
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background:
              'radial-gradient(circle at 80% 50%, rgba(30,30,112,0.4), transparent 50%), radial-gradient(circle at 20% 100%, rgba(255,128,0,0.06), transparent 50%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Fundamentos{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #ffb060, #ff8000)' }}
              >
                Técnicos
              </span>
            </h2>
            <p className="text-white/55 text-base mt-4 max-w-2xl mx-auto">
              Selecciona un fundamento para descubrir el detalle técnico que trabajamos en cada sesión.
            </p>
          </div>

          {/* Pill tabs */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
            {[
              { Icon: Send, label: 'Pase' },
              { Icon: CircleDot, label: 'Control' },
              { Icon: Zap, label: 'Conducción' },
              { Icon: Goal, label: 'Definición' },
              { Icon: Eye, label: 'Visión' },
            ].map(({ Icon, label }, i) => {
              const active = fundamentoIdx === i
              return (
                <button
                  key={label}
                  onClick={() => setFundamentoIdx(i)}
                  className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    active
                      ? 'bg-[#ff8000] text-white shadow-lg shadow-orange-500/30'
                      : 'bg-white/[0.03] text-white/65 border border-white/10 hover:border-[#ff8000]/40 hover:text-white'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              )
            })}
          </div>

          {/* Detail card */}
          {(() => {
            const fundamentos = [
              {
                Icon: Send,
                title: 'PASE',
                subtitle: 'El lenguaje del fútbol.',
                body: 'El pase es la base del juego en equipo. Un buen pase no solo entrega el balón, también otorga ventaja de tiempo y espacio a tu compañero.',
                details: [
                  'Borde interno: máxima precisión y seguridad en distancias cortas.',
                  'Empeine: potencia y tensión para cambios de frente o envíos largos.',
                  'Pie de apoyo: debe apuntar hacia el objetivo para direccionar correctamente.',
                  'Peso del pase: ajustar la fuerza según la distancia y la presión rival.',
                ],
              },
              {
                Icon: CircleDot,
                title: 'CONTROL',
                subtitle: 'Dominar el primer toque.',
                body: 'Control orientado en espacios reducidos. Dominar el primer toque te da el tiempo y la ventaja para tomar la mejor decisión antes de la próxima acción.',
                details: [
                  'Borde interno: la zona más segura para amortiguar el balón.',
                  'Empeine y pecho: control con dirección al espacio libre.',
                  'Cuerpo de cara al juego: ver opciones antes de recibir.',
                  'Primer toque orientado: salir con ventaja, no quedarse quieto.',
                ],
              },
              {
                Icon: Zap,
                title: 'CONDUCCIÓN',
                subtitle: 'Llevar el juego en carrera.',
                body: 'Manejo del balón en velocidad con cambios de dirección. Conducir con criterio para romper líneas, crear espacios y desequilibrar al rival.',
                details: [
                  'Toques cortos: control del balón pegado al pie en velocidad.',
                  'Visión periférica: ver compañeros y rivales mientras avanzas.',
                  'Cambio de ritmo: acelerar y frenar para desequilibrar al marcador.',
                  'Protección del balón: cuerpo entre el balón y el rival.',
                ],
              },
              {
                Icon: Goal,
                title: 'DEFINICIÓN',
                subtitle: 'Convertir las oportunidades.',
                body: 'Remate con empeine, interior o borde. Lectura del arquero, ángulos y serenidad en el área para terminar bien cada jugada generada.',
                details: [
                  'Pie de apoyo firme: estabilidad antes del remate.',
                  'Mirar al arco: leer la posición del arquero antes de definir.',
                  'Tipo de remate: ajustar técnica al ángulo y a la distancia.',
                  'Definición fría: serenidad en la última acción.',
                ],
              },
              {
                Icon: Eye,
                title: 'VISIÓN',
                subtitle: 'Leer la cancha antes de recibir.',
                body: 'Anticipar movimientos, encontrar espacios y elegir la mejor opción bajo presión. La diferencia entre jugar y entender el juego.',
                details: [
                  'Escanear antes de recibir: revisar el campo con la mirada.',
                  'Anticipación: leer la jugada antes de que ocurra.',
                  'Decisión: elegir la mejor opción en cada acción.',
                  'Comunicación: pedir el balón y guiar al compañero.',
                ],
              },
            ]
            const f = fundamentos[fundamentoIdx]
            const FIcon = f.Icon
            return (
              <div
                className="relative rounded-3xl p-7 md:p-10 border border-white/10"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(15,15,45,0.95) 0%, rgba(10,10,30,0.9) 100%)',
                }}
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#ff8000]/15 flex items-center justify-center flex-shrink-0">
                    <FIcon size={22} className="text-[#ff8000]" />
                  </div>
                  <div>
                    <h3 className="text-white font-black text-2xl tracking-wide">{f.title}</h3>
                    <p className="text-[#ff8000] text-sm font-semibold mt-0.5">{f.subtitle}</p>
                  </div>
                </div>
                <p className="text-white/70 text-base leading-relaxed mb-7 max-w-3xl">{f.body}</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {f.details.map((d) => (
                    <div
                      key={d}
                      className="flex items-start gap-3 bg-black/40 border border-white/8 rounded-xl px-4 py-3"
                    >
                      <Check size={16} className="text-[#ff8000] mt-0.5 flex-shrink-0" />
                      <p className="text-white/75 text-sm leading-relaxed">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      </section>

      {/* ══════════ SECCIÓN 5 — ESTRUCTURA DE LA SESIÓN ══════════ */}
      <section
        id="sesion"
        className="relative bg-black py-24 px-5 overflow-hidden"
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            background:
              'radial-gradient(circle at 50% 100%, rgba(30,30,112,0.45), transparent 60%), radial-gradient(circle at 90% 0%, rgba(255,128,0,0.05), transparent 50%)',
          }}
        />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Estructura de la{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #ffb060, #ff8000)' }}
              >
                Sesión
              </span>
            </h2>
            <p className="text-white/55 text-base mt-4 max-w-2xl mx-auto">
              Cada entrenamiento dura 1 hora, estructurada estratégicamente para maximizar el aprendizaje y el rendimiento.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { Icon: Target,    roman: 'I',   num: '1', title: 'Evaluación',           desc: 'Evaluación inicial a través de rúbrica fundamentada para conocer el nivel actual del jugador.' },
              { Icon: Activity,  roman: 'II',  num: '2', title: 'Enfoque & Corrección', desc: 'Trabajo post-evaluación, correcciones y perfeccionamiento de fundamentos técnicos y capacidades físicas básicas.' },
              { Icon: Zap,       roman: 'III', num: '3', title: 'Desarrollo Táctico',   desc: 'Corregir errores y buscar variantes técnico-tácticas para desarrollar un deportista más ligero y eficaz.' },
              { Icon: CircleDot, roman: 'IV',  num: '4', title: 'Vuelta a la Calma',    desc: 'Disminución de la intensidad, estiramientos y finalización de la sesión deportiva.' },
            ].map(({ Icon, roman, num, title, desc }) => (
              <div
                key={num}
                className="relative rounded-3xl p-6 border border-white/10 overflow-hidden group hover:border-[#ff8000]/40 transition-colors"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(15,15,45,0.7) 0%, rgba(10,10,30,0.6) 100%)',
                }}
              >
                <span
                  className="absolute top-2 right-4 font-black text-[110px] leading-none pointer-events-none select-none"
                  style={{ color: 'rgba(255,255,255,0.04)' }}
                  aria-hidden
                >
                  {num}
                </span>
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-[#ff8000]/15 flex items-center justify-center mb-12">
                    <Icon size={22} className="text-[#ff8000]" />
                  </div>
                  <p className="text-white/45 text-xs font-bold tracking-widest uppercase mb-1">
                    Etapa {roman}
                  </p>
                  <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ SECCIÓN 6 — ETAPAS EVOLUTIVAS ══════════ */}
      <section
        id="etapas"
        className="relative bg-black py-24 px-5 overflow-hidden"
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            background:
              'radial-gradient(circle at 10% 50%, rgba(30,30,112,0.4), transparent 50%), radial-gradient(circle at 90% 90%, rgba(255,128,0,0.06), transparent 50%)',
          }}
        />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Etapas{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #ffb060, #ff8000)' }}
              >
                Evolutivas
              </span>
            </h2>
            <p className="text-white/55 text-base mt-4 max-w-2xl mx-auto">
              Adaptamos las cargas, la intensidad y el enfoque técnico a la edad biológica y nivel de cada jugador.
            </p>
          </div>

          <div className="space-y-5">
            {[
              {
                fase: 'FASE 1',
                titulo: 'Iniciación',
                edadGlobal: 'De 7 a 10 años (Iniciación y Formación Base)',
                bullets: [
                  'Formación en valores y hábitos saludables.',
                  'Nociones técnicas individuales y colectivas.',
                  'Coordinación, equilibrio y agilidad.',
                ],
                subgrupos: [
                  { titulo: '7-8 años (Formación Base)', desc: 'Fase sensible de coordinación. Aprendizaje motor rápido. Conocimiento del propio cuerpo y juegos con balón.' },
                  { titulo: '9-10 años', desc: 'Máxima capacidad de aprendizaje motor. Velocidad latente. Iniciación al fútbol 5 y fútbol 7.' },
                ],
              },
              {
                fase: 'FASE 2',
                titulo: 'Competencia',
                edadGlobal: 'De 11 a 15 años (Especialización y Perfeccionamiento)',
                bullets: [
                  'Psicología del jugador y trabajo en equipo.',
                  'Desarrollo de fuerza, velocidad y resistencia.',
                  'Técnica colectiva y táctica adaptada al juego.',
                ],
                subgrupos: [
                  { titulo: '11-13 años (Especialización)', desc: 'Búsqueda de capacidades físicas. Introducción a trabajos de fuerza y resistencia aeróbica.' },
                  { titulo: '14-15 años (Perfeccionamiento)', desc: 'Entrenamiento específico individualizado. Altos niveles para el jugador según su posición.' },
                ],
              },
            ].map(({ fase, titulo, edadGlobal, bullets, subgrupos }) => (
              <div
                key={fase}
                className="rounded-3xl border border-white/10 p-6 md:p-8"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(15,15,45,0.7) 0%, rgba(10,10,30,0.6) 100%)',
                }}
              >
                <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-start">
                  {/* Left: info */}
                  <div>
                    <span className="inline-block text-[#ff8000] text-[10px] font-black tracking-[0.2em] uppercase border border-[#ff8000]/40 px-3 py-1 rounded-full bg-[#ff8000]/5 mb-4">
                      {fase}
                    </span>
                    <h3 className="text-white font-black text-3xl mb-1">{titulo}</h3>
                    <p className="text-white/45 text-xs mb-5">{edadGlobal}</p>
                    <ul className="space-y-2.5">
                      {bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2.5 text-sm text-white/75">
                          <span className="w-4 h-4 rounded-full border border-[#ff8000]/50 flex items-center justify-center mt-0.5 flex-shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ff8000]" />
                          </span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right: subgrupos */}
                  <div className="md:col-span-2 grid sm:grid-cols-2 gap-3">
                    {subgrupos.map((s) => (
                      <div
                        key={s.titulo}
                        className="bg-black/40 border border-white/8 rounded-2xl p-5"
                      >
                        <h4 className="text-white font-bold text-sm mb-2">{s.titulo}</h4>
                        <p className="text-white/55 text-xs leading-relaxed">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ SECCIÓN 7 — BENEFICIOS ══════════ */}
      <section
        id="beneficios"
        className="relative bg-black py-24 px-5 overflow-hidden"
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            background:
              'radial-gradient(circle at 70% 30%, rgba(30,30,112,0.45), transparent 50%), radial-gradient(circle at 20% 80%, rgba(255,128,0,0.05), transparent 50%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-black text-white">
              ¿Por qué entrenar con{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #ffb060, #ff8000)' }}
              >
                El Gocho?
              </span>
            </h2>
            <p className="text-white/55 text-base mt-4 max-w-2xl mx-auto leading-relaxed">
              Entrenar con la metodología del Gocho te permitirá desarrollar habilidades fundamentales para mejorar tu rendimiento dentro del campo. Nuestro entrenamiento está diseñado para potenciar al futbolista de manera integral.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { Icon: Target,   title: 'Mejora de la técnica individual',  desc: 'Perfeccionamos el control del balón, conducción, pase y finalización para que el jugador se sienta más seguro en cada acción del juego.', tint: 'from-[#ff8000]/25 to-[#ff8000]/5' },
              { Icon: Zap,      title: 'Mayor coordinación y agilidad',    desc: 'Trabajamos ejercicios específicos que ayudan a mejorar los movimientos, cambios de dirección y la velocidad de reacción.', tint: 'from-amber-500/25 to-amber-500/5' },
              { Icon: Brain,    title: 'Desarrollo de la inteligencia táctica', desc: 'Los jugadores aprenden a tomar mejores decisiones dentro del campo y a entender mejor el juego.', tint: 'from-fuchsia-500/25 to-fuchsia-500/5' },
              { Icon: Heart,    title: 'Preparación física específica para fútbol', desc: 'Entrenamientos enfocados en mejorar resistencia, equilibrio, fuerza y explosividad adaptada al fútbol.', tint: 'from-rose-500/25 to-rose-500/5' },
              { Icon: Shield,   title: 'Más confianza y seguridad en el juego', desc: 'Al mejorar sus habilidades, los jugadores se sienten más preparados para competir y enfrentar nuevos desafíos.', tint: 'from-emerald-500/25 to-emerald-500/5' },
              { Icon: Users,    title: 'Trabajo en equipo y liderazgo',    desc: 'Aprende a comunicarse, apoyar al compañero y entender que cada rol cuenta. Líderes conscientes dentro y fuera de la cancha.', tint: 'from-sky-500/25 to-sky-500/5' },
            ].map(({ Icon, title, desc, tint }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/8 p-6 hover:border-[#ff8000]/40 transition-colors"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(15,15,45,0.6) 0%, rgba(10,10,30,0.5) 100%)',
                }}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tint} flex items-center justify-center mb-4 border border-white/10`}>
                  <Icon size={20} className="text-[#ff8000]" />
                </div>
                <h3 className="text-white font-bold text-base mb-2 leading-snug">{title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* CTA card */}
          <div
            className="mt-8 rounded-3xl border border-[#ff8000]/25 p-6 md:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,128,0,0.10) 0%, rgba(15,15,45,0.7) 60%)',
            }}
          >
            <div>
              <p className="text-white font-bold text-lg md:text-xl flex items-start md:items-center gap-2">
                <span aria-hidden>⚽</span> ¿Quieres mejorar tu juego y llevar tu rendimiento al siguiente nivel?
              </p>
              <p className="text-[#ff8000] font-semibold text-sm mt-1">
                Este es tu lugar. Únete a la metodología del Gocho.
              </p>
            </div>
            <button
              onClick={scrollToForm}
              className="flex-shrink-0 bg-[#ff8000] text-white font-bold px-6 py-3 rounded-full hover:bg-orange-600 active:scale-95 transition-all shadow-lg shadow-orange-500/20 whitespace-nowrap"
            >
              Ver Planes y Precios
            </button>
          </div>
        </div>
      </section>

      {/* ══════════ SECCIÓN 8 — PROGRAMAS Y PRECIOS ══════════ */}
      <section id="programas" className="relative bg-black py-24 px-5 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            background:
              'radial-gradient(circle at 80% 30%, rgba(30,30,112,0.45), transparent 50%), radial-gradient(circle at 20% 90%, rgba(255,128,0,0.06), transparent 50%)',
          }}
        />
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Planes de{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #ffb060, #ff8000)' }}
              >
                Entrenamiento
              </span>
            </h2>
            <p className="text-white/55 text-base mt-4 max-w-2xl mx-auto">
              Elige el plan que mejor se adapte a tus objetivos. Horarios a elección según disponibilidad.{' '}
              <span className="text-white font-semibold">Duración por sesión: 1 hora.</span>
            </p>
            <span className="inline-block mt-5 text-[#ff8000] text-xs font-bold tracking-widest uppercase border border-[#ff8000]/40 px-4 py-1.5 rounded-full bg-[#ff8000]/5">
              Pago por paquete · sin mensualidad
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Card 1 — Grupal */}
            <div
              className="relative rounded-3xl p-7 border-2 border-[#ff8000]/50"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,128,0,0.08) 0%, rgba(15,15,45,0.7) 60%)',
              }}
            >
              <div className="absolute -top-3 left-6 bg-[#ff8000] text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase">
                Más popular
              </div>
              <h3 className="text-white font-black text-2xl mt-2">Entrenamiento Grupal</h3>
              <p className="text-[#ff8000] text-sm font-semibold mt-1 mb-6">Coach Cristopher Martínez</p>
              <div className="space-y-2.5 mb-7">
                {[
                  { left: 'Pago único · 5 clases', right: '$40' },
                  { left: 'Por sesión', right: '$8' },
                  { left: 'Máx. 6 jugadores · Vie/Sáb/Dom', right: '1 h' },
                ].map(({ left, right }) => (
                  <div
                    key={left}
                    className="flex items-center justify-between bg-black/40 border border-white/8 rounded-xl px-4 py-3"
                  >
                    <p className="text-white/75 text-sm">{left}</p>
                    <p className="text-white font-bold text-sm whitespace-nowrap">{right}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={scrollToForm}
                className="w-full bg-[#ff8000] text-white font-bold py-3 rounded-full hover:bg-orange-600 active:scale-95 transition-all shadow-lg shadow-orange-500/20"
              >
                Inscribirme →
              </button>
            </div>

            {/* Card 2 — Personalizado */}
            <div
              className="rounded-3xl p-7 border border-white/10"
              style={{
                background:
                  'linear-gradient(135deg, rgba(15,15,45,0.7) 0%, rgba(10,10,30,0.6) 100%)',
              }}
            >
              <h3 className="text-white font-black text-2xl mt-2">Entrenamiento Personalizado</h3>
              <p className="text-[#ff8000] text-sm font-semibold mt-1 mb-6">Coach Cristopher Martínez</p>
              <div className="space-y-2.5 mb-7">
                {[
                  { left: 'Clase individual · 1 hora', right: 'Consultar' },
                  { left: 'En tu espacio o el del coach', right: '✓' },
                  { left: 'Plan según objetivos', right: '✓' },
                ].map(({ left, right }) => (
                  <div
                    key={left}
                    className="flex items-center justify-between bg-black/40 border border-white/8 rounded-xl px-4 py-3"
                  >
                    <p className="text-white/75 text-sm">{left}</p>
                    <p className="text-white font-bold text-sm whitespace-nowrap">{right}</p>
                  </div>
                ))}
              </div>
              <a
                href={`${WA_BASE}?text=${encodeURIComponent('Hola, me interesa el entrenamiento personalizado de El Gocho Entrenador')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-[#15154a] text-white font-bold py-3 rounded-full hover:bg-[#1e1e70] active:scale-95 transition-all border border-white/10"
              >
                Consultar por WhatsApp
              </a>
            </div>
          </div>

          <p className="text-white/40 text-sm text-center mt-8">
            Métodos de pago:{' '}
            <span className="text-white/70 font-medium">Efectivo · Pagomóvil · Binance Pay · Transferencia · Bs</span>
          </p>
        </div>
      </section>

      {/* ══════════ SECCIÓN 9 — LOGROS ══════════ */}
      <section id="logros" className="relative bg-black py-24 px-5 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            background:
              'radial-gradient(circle at 30% 20%, rgba(30,30,112,0.4), transparent 50%), radial-gradient(circle at 70% 90%, rgba(255,128,0,0.06), transparent 50%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #ff8000 1px, transparent 1px)', backgroundSize: '30px 30px' }}
        />
        <div className="relative max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Resultados que{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #ffb060, #ff8000)' }}
              >
                hablan.
              </span>
            </h2>
            <p className="text-white/55 text-base mt-4">
              Tres años de palmarés acumulado en las principales ligas juveniles de Caracas.
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-4 bottom-4 w-px bg-[#ff8000]/25" />
            <div className="space-y-4">
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
                  <div
                    className="rounded-2xl px-5 py-4 flex-1 border border-white/10"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(15,15,45,0.7) 0%, rgba(10,10,30,0.5) 100%)',
                    }}
                  >
                    <span className="text-[#ff8000] text-xs font-bold tracking-wider">{year}</span>
                    <p className="text-white font-bold text-base mt-0.5">{title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ SECCIÓN 10 — UBICACIÓN Y HORARIOS ══════════ */}
      <section id="ubicacion" className="relative bg-black py-24 px-5 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            background:
              'radial-gradient(circle at 70% 30%, rgba(30,30,112,0.45), transparent 50%), radial-gradient(circle at 10% 80%, rgba(255,128,0,0.05), transparent 50%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Dónde{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #ffb060, #ff8000)' }}
              >
                entrenamos.
              </span>
            </h2>
            <p className="text-white/55 text-base mt-4 max-w-2xl mx-auto">
              Cancha al aire libre en el corazón de Caracas. Cupos limitados por turno para garantizar atención personalizada.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <iframe
                src="https://maps.google.com/maps?q=Parque+Aristides+Rojas+Avenida+Andres+Bello+Caracas+Venezuela&output=embed&z=16"
                width="100%"
                height="100%"
                style={{ border: 0, display: 'block', minHeight: '360px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación El Gocho Entrenador"
              />
            </div>
            <div
              className="rounded-3xl border border-white/10 p-7"
              style={{
                background:
                  'linear-gradient(135deg, rgba(15,15,45,0.7) 0%, rgba(10,10,30,0.6) 100%)',
              }}
            >
              <div className="flex items-start gap-3 mb-6 pb-6 border-b border-white/10">
                <MapPin size={20} className="text-[#ff8000] mt-0.5 flex-shrink-0" />
                <p className="text-white/75 text-sm leading-relaxed">
                  Parque Arístides Rojas, Av. Andrés Bello,<br />
                  frente a la Hermandad Gallega, Caracas
                </p>
              </div>
              <h3 className="text-white font-bold text-base mb-4">Horarios disponibles</h3>
              <div className="space-y-2.5">
                {DIAS.map(dia => (
                  <div key={dia} className="bg-black/30 border border-white/8 rounded-xl px-4 py-3">
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
              <p className="text-white/40 text-xs mt-4">Máximo 6 jugadores por turno</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ SECCIÓN 11 — TESTIMONIOS ══════════ */}
      <section className="relative bg-black py-24 px-5 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            background:
              'radial-gradient(circle at 20% 30%, rgba(30,30,112,0.4), transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,128,0,0.05), transparent 50%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Lo que dicen las{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #ffb060, #ff8000)' }}
              >
                familias.
              </span>
            </h2>
            <p className="text-white/55 text-base mt-4 max-w-2xl mx-auto">
              Voces reales de quienes ya forman parte del equipo.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {(['JR', 'MC', 'AP'] as const).map((initials, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/8 p-6"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(15,15,45,0.6) 0%, rgba(10,10,30,0.5) 100%)',
                }}
              >
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
                <p className="text-white/35 text-sm italic leading-relaxed">
                  Próximamente testimonios reales de nuestras familias
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ SECCIÓN 12 — FORMULARIO ══════════ */}
      <div
        ref={formRef}
        id="inscripcion"
        className="relative bg-black py-24 px-5 overflow-hidden"
        onFocus={() => { formTouchedRef.current = true }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            background:
              'radial-gradient(circle at 50% 0%, rgba(30,30,112,0.5), transparent 60%), radial-gradient(circle at 80% 100%, rgba(255,128,0,0.06), transparent 50%)',
          }}
        />
        <div className="relative max-w-lg mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.1]">
              Inicia tu{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, #ffb060, #ff8000)' }}
              >
                proceso hoy.
              </span>
            </h2>
            <p className="text-white/55 text-base mt-4">
              Completa el formulario y te contactamos en 24 horas por WhatsApp.
            </p>
          </div>

          {enviado ? (
            <div
              className="rounded-3xl p-10 text-center border border-[#ff8000]/30"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,128,0,0.08) 0%, rgba(15,15,45,0.7) 60%)',
              }}
            >
              <div className="w-20 h-20 bg-[#ff8000]/15 rounded-full flex items-center justify-center mx-auto mb-5">
                <Check size={38} className="text-[#ff8000]" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">¡Recibimos tu solicitud!</h3>
              <p className="text-white/65 mb-8 leading-relaxed">
                Te contactaremos en las próximas 24 horas por WhatsApp para confirmar tu cupo.
              </p>
              <a
                href={`${WA_BASE}?text=${WA_MSG}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold px-6 py-3 rounded-full hover:bg-green-600 transition"
              >
                <MessageCircle size={18} /> Escribir al coach
              </a>
            </div>
          ) : (
            <div
              className="rounded-3xl p-6 md:p-8 border border-white/10"
              style={{
                background:
                  'linear-gradient(135deg, rgba(15,15,45,0.7) 0%, rgba(10,10,30,0.6) 100%)',
              }}
            >
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
                    <label htmlFor="nombre-jugador" className="block text-white/50 text-xs font-semibold mb-1.5 uppercase tracking-wider">Nombre *</label>
                    <input id="nombre-jugador" type="text" value={s1.nombreJugador} onChange={e => setS1({ ...s1, nombreJugador: e.target.value })} placeholder="Ej: Carlos" className={input} />
                  </div>
                  <div>
                    <label htmlFor="apellidos-jugador" className="block text-white/50 text-xs font-semibold mb-1.5 uppercase tracking-wider">Apellidos *</label>
                    <input id="apellidos-jugador" type="text" value={s1.apellidosJugador} onChange={e => setS1({ ...s1, apellidosJugador: e.target.value })} placeholder="Ej: Rodríguez Pérez" className={input} />
                  </div>
                  <div>
                    <label htmlFor="fecha-nacimiento" className="block text-white/50 text-xs font-semibold mb-1.5 uppercase tracking-wider">Fecha de nacimiento *</label>
                    <input id="fecha-nacimiento" type="date" value={s1.fechaNacimiento} onChange={e => setS1({ ...s1, fechaNacimiento: e.target.value })} className={input} style={{ colorScheme: 'dark' }} />
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
                    <label htmlFor="nombre-representante" className="block text-white/50 text-xs font-semibold mb-1.5 uppercase tracking-wider">Tu nombre completo *</label>
                    <input id="nombre-representante" type="text" value={s2.nombreRepresentante} onChange={e => setS2({ ...s2, nombreRepresentante: e.target.value })} placeholder="Ej: María González" className={input} />
                  </div>
                  <div>
                    <label htmlFor="telefono-representante" className="block text-white/50 text-xs font-semibold mb-1.5 uppercase tracking-wider">Teléfono *</label>
                    <div className="flex gap-2">
                      <select
                        value={paisIdx}
                        onChange={e => setPaisIdx(Number(e.target.value))}
                        className="bg-white/5 border border-white/15 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-[#ff8000] focus:ring-1 focus:ring-[#ff8000] transition flex-shrink-0 w-[52%]"
                        style={{ colorScheme: 'dark' }}
                        aria-label="Código de país"
                      >
                        {PAISES.map((p, i) => (
                          <option key={i} value={i} style={{ background: '#1e1e70', color: '#fff' }}>
                            {p.bandera} {p.nombre} ({p.codigo})
                          </option>
                        ))}
                      </select>
                      <input
                        id="telefono-representante"
                        type="tel"
                        value={numeroTel}
                        onChange={e => setNumeroTel(e.target.value)}
                        placeholder="414 123 4567"
                        className={input}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email-representante" className="block text-white/50 text-xs font-semibold mb-1.5 uppercase tracking-wider">
                      Email <span className="text-white/25 normal-case">(opcional)</span>
                    </label>
                    <input id="email-representante" type="email" value={s2.emailRepresentante} onChange={e => setS2({ ...s2, emailRepresentante: e.target.value })} placeholder="ejemplo@correo.com" className={input} />
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
                          onClick={() => { setS3({ ...s3, dia, hora: '' }); setTurnoInfo('') }}
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
                            onClick={() => {
                              if (lleno) {
                                setTurnoInfo('Este turno está lleno. Puedes seleccionar otro día u hora, o hablar la posibilidad con el entrenador.')
                              } else {
                                setTurnoInfo('')
                                setS3({ ...s3, hora })
                              }
                            }}
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
                    {turnoInfo && (
                      <div className="mt-3 flex items-start gap-2 bg-[#ff8000]/10 border border-[#ff8000]/30 rounded-xl px-4 py-3">
                        <span className="text-[#ff8000] text-base leading-none mt-0.5">⚠️</span>
                        <p className="text-[#ff8000]/90 text-xs leading-relaxed">{turnoInfo}</p>
                      </div>
                    )}
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

      {/* ══════════ SECCIÓN 13 — FOOTER ══════════ */}
      <footer className="bg-black border-t border-white/8 py-10 px-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="El Gocho Entrenador" width={36} height={36} className="object-contain" />
            <p className="text-white font-black text-base">
              El Gocho Entrenador<span className="text-[#ff8000]">.</span>
            </p>
          </div>
          <p className="text-white/35 text-xs text-center order-3 md:order-2">
            © 2026 El Gocho Entrenador · Caracas, Venezuela
          </p>
          <div className="flex items-center gap-2 order-2 md:order-3">
            <a
              href="https://www.instagram.com/elgochoentrenador"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-[#ff8000]/20 hover:border-[#ff8000]/40 transition"
              aria-label="Instagram"
            >
              <InstagramIcon size={16} />
            </a>
            <a
              href="https://www.tiktok.com/@elgochoentrenador"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-[#ff8000]/20 hover:border-[#ff8000]/40 transition"
              aria-label="TikTok"
            >
              <TikTokIcon size={16} />
            </a>
            <a
              href={`${WA_BASE}?text=${WA_MSG}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 bg-[#25D366]/15 border border-[#25D366]/30 rounded-full flex items-center justify-center hover:bg-[#25D366]/30 transition"
              aria-label="WhatsApp"
            >
              <MessageCircle size={16} color="#25D366" />
            </a>
          </div>
        </div>
      </footer>

    </div>
  )
}
