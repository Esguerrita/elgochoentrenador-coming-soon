import { ImageResponse } from 'next/og'

export const size = { width: 256, height: 256 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1e1e70',
          borderRadius: '20%',
        }}
      >
        <span
          style={{
            color: '#ffffff',
            fontSize: '148px',
            fontWeight: 900,
            fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            letterSpacing: '-6px',
            lineHeight: 1,
          }}
        >
          G8
        </span>
      </div>
    ),
    { ...size }
  )
}
