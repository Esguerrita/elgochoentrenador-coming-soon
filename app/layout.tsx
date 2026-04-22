import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "El Gocho Entrenador — Academia de Fútbol en Caracas",
  description: "Formando jugadores inteligentes, educando líderes conscientes. Academia de fútbol para niños de 7 a 15 años en Caracas.",
  keywords: "academia futbol caracas, entrenamiento futbol niños, el gocho entrenador, futbol juvenil caracas",
  openGraph: {
    title: "El Gocho Entrenador — Academia de Fútbol",
    description: "Formando jugadores inteligentes, educando líderes conscientes.",
    locale: "es_VE",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
