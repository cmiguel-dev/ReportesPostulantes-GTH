// app/layout.js

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
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      </head>
      <body>
        <div className="d-flex">
          {/* Sidebar */}
          <aside
            className="bg-dark text-white p-3"
            style={{ width: "250px", minHeight: "100vh" }}
          >
            <h4>GTH</h4>
            <hr />

            <ul className="nav flex-column">
              <li className="nav-item">
                <a href="/onboarding" className="nav-link text-white">
                  Onboarding
                </a>
              </li>

              <li className="nav-item">
                <a href="/reportes" className="nav-link text-white">
                  Reportes P.A.
                </a>
              </li>

              <li className="nav-item">
                <a href="/permisos" className="nav-link text-white">
                  Permisos
                </a>
              </li>

              <li className="nav-item">
                <a href="/salida" className="nav-link text-white">
                  Salida
                </a>
              </li>
            </ul>
          </aside>

          {/* Contenido */}
          <main className="flex-grow-1 p-4 bg-light">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}