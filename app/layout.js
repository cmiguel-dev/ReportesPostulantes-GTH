// app/layout.js

import Script from "next/script";
import Link from "next/link";

export const metadata = {
  title: "GTH System",
  description: "Sistema de Gestión de Talento Humano",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <div className="d-flex">
          {/* Sidebar */}
          <aside
            className="bg-dark text-white p-3"
            style={{ width: "250px", minHeight: "100vh" }}
          >
            <h4>
              <Link href="/" className="text-white text-decoration-none">
                Reporter de Postulantes - GTH
              </Link>
            </h4>
            <hr />

            <ul className="nav flex-column">
              <li className="nav-item">
                <Link href="/onboarding" className="nav-link text-white">
                  Onboarding
                </Link>
              </li>
              <hr />
              <li className="nav-item">
                <Link href="/reportes" className="nav-link text-white">
                  Postulantes Antiguos
                </Link>
              </li>
              <hr />
              <li className="nav-item">
                <Link href="/postulantes-actuales" className="nav-link text-white">
                  Postulantes Actuales (Wix)
                </Link>
              </li>
            </ul>
          </aside>

          {/* Contenido */}
          <main className="flex-grow-1 p-4 bg-light">
            {children}
          </main>
        </div>
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}