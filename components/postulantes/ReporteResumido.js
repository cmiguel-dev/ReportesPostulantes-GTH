// components/postulantes/ReporteResumido.js
"use client";

import { useState } from "react";
import { ESTADOS_POSTULANTE } from "../../services/postulantesActualesService";

export default function ReporteResumido({ postulantes }) {
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroPeriodo, setFiltroPeriodo] = useState("todos");
  const [copiado, setCopiado] = useState(false);

  // Filtrar datos para el reporte
  const datosFiltrados = () => {
    let filtered = [...postulantes];
    
    // Filtro por estado
    if (filtroEstado !== "todos") {
      filtered = filtered.filter(p => p.estado_postulante === filtroEstado);
    }
    
    // Filtro por período
    if (filtroPeriodo !== "todos") {
      const ahora = new Date();
      let fechaLimite = new Date();
      
      switch(filtroPeriodo) {
        case "1sem":
          fechaLimite.setDate(ahora.getDate() - 7);
          break;
        case "2sem":
          fechaLimite.setDate(ahora.getDate() - 14);
          break;
        case "1mes":
          fechaLimite.setMonth(ahora.getMonth() - 1);
          break;
        case "3meses":
          fechaLimite.setMonth(ahora.getMonth() - 3);
          break;
        default:
          fechaLimite = null;
      }
      
      if (fechaLimite) {
        filtered = filtered.filter(p => {
          if (!p.fecha_postulacion) return false;
          return new Date(p.fecha_postulacion) >= fechaLimite;
        });
      }
    }
    
    return filtered;
  };

  // Generar estadísticas para el reporte
  const generarEstadisticas = () => {
    const datos = datosFiltrados();
    
    // Estadísticas por estado
    const porEstado = {};
    ESTADOS_POSTULANTE.forEach(e => {
      porEstado[e.valor] = 0;
    });
    
    // Top áreas
    const areas = {};
    
    datos.forEach(p => {
      porEstado[p.estado_postulante] = (porEstado[p.estado_postulante] || 0) + 1;
      areas[p.area] = (areas[p.area] || 0) + 1;
    });
    
    const topAreas = Object.entries(areas)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    return { datos, porEstado, topAreas, total: datos.length };
  };

  // Generar texto para WhatsApp
  const generarTextoReporte = () => {
    const { porEstado, topAreas, total } = generarEstadisticas();
    const fecha = new Date().toLocaleDateString('es-PE');
    
    let texto = `📊 *REPORTE POSTULANTES - SANILAB*\n`;
    texto += `📅 Fecha: ${fecha}\n`;
    texto += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    texto += `📌 *RESUMEN GENERAL*\n`;
    texto += `Total postulantes: ${total}\n\n`;
    
    texto += `📊 *DISTRIBUCIÓN POR ESTADO*\n`;
    ESTADOS_POSTULANTE.forEach(estado => {
      const cantidad = porEstado[estado.valor] || 0;
      if (cantidad > 0 || filtroEstado === "todos") {
        texto += `${estado.label}: ${cantidad}\n`;
      }
    });
    
    if (topAreas.length > 0) {
      texto += `\n🏢 *TOP ÁREAS DE INTERÉS*\n`;
      topAreas.forEach(([area, cantidad], idx) => {
        texto += `${idx + 1}. ${area}: ${cantidad}\n`;
      });
    }
    
    texto += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
    texto += `📱 Reporte generado desde GTH System\n`;
    
    return texto;
  };

  const handleCopiar = async () => {
    const texto = generarTextoReporte();
    await navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const { total, porEstado } = generarEstadisticas();
  const periodos = [
    { valor: "todos", label: "Todos" },
    { valor: "1sem", label: "Última semana" },
    { valor: "2sem", label: "Últimas 2 semanas" },
    { valor: "1mes", label: "Último mes" },
    { valor: "3meses", label: "Últimos 3 meses" }
  ];

  return (
    <div>
      <div className="alert alert-info">
        <i className="bi bi-info-circle"></i> Aquí puedes generar reportes resumidos para compartir por WhatsApp. Los datos se copian en formato texto plano.
      </div>
      
      {/* Filtros del reporte */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-5 mb-2">
              <label className="form-label">📌 Filtrar por Estado</label>
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
            
            <div className="col-md-5 mb-2">
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
            
            <div className="col-md-2 mb-2 d-flex align-items-end">
              <button 
                className="btn btn-success w-100"
                onClick={handleCopiar}
              >
                {copiado ? "✓ ¡Copiado!" : "📋 Copiar reporte"}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Vista previa del reporte */}
      <div className="card">
        <div className="card-header">
          <h5>📄 Vista previa del reporte</h5>
        </div>
        <div className="card-body">
          <div className="bg-light p-3 rounded" style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
            {generarTextoReporte()}
          </div>
        </div>
      </div>
      
      {/* Resumen rápido */}
      <div className="row mt-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h6 className="card-title">Total postulantes</h6>
              <h3>{total}</h3>
            </div>
          </div>
        </div>
        {ESTADOS_POSTULANTE.slice(0, 3).map(estado => (
          <div key={estado.valor} className="col-md-3">
            <div className={`card bg-${estado.badge} bg-opacity-25`}>
              <div className="card-body">
                <h6 className="card-title">{estado.label}</h6>
                <h3>{porEstado[estado.valor] || 0}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}