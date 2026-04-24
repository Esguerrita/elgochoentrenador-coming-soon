import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://elgochoentrenador.com'),
  title: 'El Gocho Entrenador — Academia de Fútbol en Caracas',
  description: 'Academia de fútbol para niños de 7 a 15 años en Caracas. Formando jugadores inteligentes y líderes conscientes. Campeones Liga Colegial 2025.',
  openGraph: {
    title: 'El Gocho Entrenador — Academia de Fútbol en Caracas',
    description: 'Academia de fútbol para niños de 7 a 15 años. Campeones Liga Colegial 2025.',
    url: 'https://elgochoentrenador.com',
    siteName: 'El Gocho Entrenador',
    locale: 'es_VE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'El Gocho Entrenador — Academia de Fútbol en Caracas',
    description: 'Academia de fútbol para niños de 7 a 15 años. Campeones Liga Colegial 2025.',
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SportsActivityLocation',
  name: 'El Gocho Entrenador',
  description: 'Academia de fútbol para niños de 7 a 15 años en Caracas',
  url: 'https://elgochoentrenador.com',
  telephone: '+584120168219',
  image: 'https://elgochoentrenador.com/coach.png',
  logo: 'https://elgochoentrenador.com/logo.png',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Parque Arístides Rojas, Av. Andrés Bello, frente a la Hermandad Gallega',
    addressLocality: 'Caracas',
    addressCountry: 'VE',
  },
  sport: 'Soccer',
  priceRange: '$40',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Friday', 'Saturday', 'Sunday'],
      opens: '09:00',
      closes: '14:00',
    },
  ],
  sameAs: [
    'https://www.instagram.com/elgochoentrenador',
    'https://www.tiktok.com/@elgochoentrenador',
  ],
  founder: {
    '@type': 'Person',
    name: 'Cristopher Martínez',
    jobTitle: 'Entrenador de Fútbol',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  )
}
