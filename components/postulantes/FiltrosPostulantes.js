// components/postulantes/FiltrosPostulantes.js

"use client";

import { ESTADOS_POSTULANTE } from "../../services/postulantesActualesService";

export default function FiltrosPostulantes({
  busqueda,
  setBusqueda,
  filtroEstado,
  setFiltroEstado,
  filtroPeriodo,
  setFiltroPeriodo
}) {
  const periodos = [
    { valor: "todos", label: "Todos" },
    { valor: "1sem", label: "Última semana" },
    { valor: "2sem", label: "Últimas 2 semanas" },
    { valor: "1mes", label: "Último mes" },
    { valor: "3meses", label: "Últimos 3 meses" }
  ];

  return (
    <div className="card mb-4">
      <div className="card-body">
        <div className="row">
          <div className="col-md-4 mb-2">
            <label className="form-label">🔍 Buscar</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nombre, email o carrera..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          
          <div className="col-md-4 mb-2">
            <label className="form-label">📌 Estado</label>
            <select 
              className="form-select"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              {ESTADOS_POSTULANTE.map((estado) => (
                <option key={estado.valor} value={estado.valor}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="col-md-4 mb-2">
            <label className="form-label">📅 Período</label>
            <select 
              className="form-select"
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value)}
            >
              {periodos.map((periodo) => (
                <option key={periodo.valor} value={periodo.valor}>
                  {periodo.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}