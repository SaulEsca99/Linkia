import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Linkia — Tu Copiloto Inteligente para Encontrar Trabajo",
  description:
    "Plataforma impulsada por IA que analiza tu CV, encuentra vacantes compatibles en LATAM y genera versiones adaptadas para cada oferta.",
  keywords: [
    "empleo",
    "trabajo",
    "CV",
    "currículum",
    "inteligencia artificial",
    "LATAM",
    "México",
    "vacantes",
    "Linkia",
  ],
  icons: {
    icon: "/branding/linkia-icon.png",
    apple: "/branding/linkia-icon.png",
    shortcut: "/branding/linkia-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans flex min-h-screen flex-col antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
