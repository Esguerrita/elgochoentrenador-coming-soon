import { ImageResponse } from 'next/og'

export const alt = 'El Gocho Entrenador — Academia de Fútbol en Caracas'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e1e70 0%, #0a0a0a 100%)',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          position: 'relative',
        }}
      >
        {/* Dot grid decoration */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,128,0,0.12) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Orange accent bar top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: '#ff8000',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0px',
            zIndex: 1,
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid rgba(255,128,0,0.4)',
              borderRadius: '100px',
              padding: '8px 24px',
              marginBottom: '32px',
            }}
          >
            <span
              style={{
                color: '#ff8000',
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '3px',
                textTransform: 'uppercase',
              }}
            >
              Academia de Fútbol · Caracas
            </span>
          </div>

          {/* Main title */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              marginBottom: '28px',
            }}
          >
            <span
              style={{
                color: '#ffffff',
                fontSize: '80px',
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              El Gocho
            </span>
            <span
              style={{
                color: '#ff8000',
                fontSize: '80px',
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              Entrenador
            </span>
          </div>

          {/* Divider */}
          <div
            style={{
              width: '80px',
              height: '3px',
              background: '#ff8000',
              borderRadius: '2px',
              marginBottom: '28px',
            }}
          />

          {/* Subtitle */}
          <span
            style={{
              color: 'rgba(241, 240, 236, 0.75)',
              fontSize: '28px',
              fontWeight: 500,
              letterSpacing: '1px',
            }}
          >
            Niños de 7 a 15 años · Vie · Sáb · Dom
          </span>
        </div>

        {/* Bottom stats */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            gap: '60px',
            zIndex: 1,
          }}
        >
          {[
            { num: '120+', label: 'Niños formados' },
            { num: '3', label: 'Años de experiencia' },
            { num: '4', label: 'Campeonatos' },
          ].map(({ num, label }) => (
            <div
              key={label}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
            >
              <span style={{ color: '#ff8000', fontSize: '32px', fontWeight: 900 }}>{num}</span>
              <span style={{ color: 'rgba(241,240,236,0.5)', fontSize: '14px', fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
