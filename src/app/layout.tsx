import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OdontIAChat — Portal da Clínica",
  description:
    "Portal de gestão da OdontIAChat: configure sua IA, acompanhe conversas, agendamentos e métricas em um só lugar.",
};

// Inline script to apply theme class before React hydrates — avoids flash of light theme on reload
const themeBootScript = `(function(){try{var s=localStorage.getItem('odontia-theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;var d=s==='dark'||(s==null&&m);if(d)document.documentElement.classList.add('dark');document.documentElement.dataset.theme=d?'dark':'light';}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${montserrat.variable} ${openSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeBootScript }}
        />
      </head>
      <body className="min-h-screen bg-bg-base text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
