import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="data:," />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

        {/* Tailwind config must come before the CDN script */}
        <script dangerouslySetInnerHTML={{ __html: `
          window.tailwind = {
            config: {
              darkMode: "class",
              theme: {
                extend: {
                  colors: {
                    "primary":          "#c8a328",
                    "background-light": "#f8f7f6",
                    "background-dark":  "#201d12",
                    "forest-green":     "#1b3022",
                    "deep-green":       "#0e1a12",
                  },
                  fontFamily: { display: ["Inter"] },
                  borderRadius: {
                    DEFAULT: "0.25rem",
                    lg:      "0.5rem",
                    xl:      "0.75rem",
                    full:    "9999px",
                  },
                },
              },
            }
          }
        `}} />

        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries" />

        {/* Default CSS variables (overridden per-page via <style> in <Head>) */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --color-primary:  200 163 40;
            --color-bg-light: 248 247 246;
            --color-bg-dark:  32 29 18;
            --color-secondary: 27 48 34;
            --color-accent:   14 26 18;
          }
          body { font-family: 'Inter', sans-serif; min-height: max(884px, 100dvh); }
          html { scroll-behavior: smooth; }
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
        `}} />
      </Head>
      <body className="bg-background-light text-slate-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
