// components/postulantes/ReporteResumido.js
"use client";

import { useState } from "react";
import { ESTADOS_POSTULANTE } from "../../services/postulantesActualesService";

export default function ReporteResumido({ postulantes }) {
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroPeriodo, setFiltroPeriodo] = useState("todos");
  const [tipoReporte, setTipoReporte] = useState("estadisticas"); // "estadisticas" o "lista"
  const [copiado, setCopiado] = useState(false);

  // Obtener nombre del período seleccionado
  const getNombrePeriodo = () => {
    const periodos = {
      "todos": "Todos",
      "1sem": "Última semana",
      "2sem": "Últimas 2 semanas",
      "1mes": "Último mes",
      "3meses": "Últimos 3 meses"
    };
    return periodos[filtroPeriodo] || "Todos";
  };

  // Obtener nombre del estado seleccionado
  const getNombreEstado = () => {
    if (filtroEstado === "todos") return "Todos los estados";
    const estado = ESTADOS_POSTULANTE.find(e => e.valor === filtroEstado);
    return estado ? estado.label : filtroEstado;
  };

  // Filtrar datos
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

  // Generar estadísticas
  const generarEstadisticas = () => {
    const datos = datosFiltrados();
    
    const porEstado = {};
    ESTADOS_POSTULANTE.forEach(e => {
      porEstado[e.valor] = 0;
    });
    
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

  // Generar texto del reporte de estadísticas
  const generarTextoEstadisticas = () => {
    const { porEstado, topAreas, total } = generarEstadisticas();
    const fecha = new Date().toLocaleDateString('es-PE');
    const nombreEstado = getNombreEstado();
    const nombrePeriodo = getNombrePeriodo();
    
    let texto = `📊 *REPORTE POSTULANTES - SANILAB*\n`;
    texto += `📅 ${fecha} | Estado: "${nombreEstado}" | Período: ${nombrePeriodo}\n`;
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

  // Generar texto del reporte de lista detallada
  const generarTextoLista = () => {
    const { datos, total } = generarEstadisticas();
    const fecha = new Date().toLocaleDateString('es-PE');
    const nombreEstado = getNombreEstado();
    const nombrePeriodo = getNombrePeriodo();
    
    // Mapeo de emojis para estados
    const emojiEstado = {
      "NUEVO (FALTA AGENDAR)": "🆕",
      "CONTACTADO (SIN RESPUESTA)": "📞",
      "ENTREVISTA AGENDADA": "📅",
      "EN EVALUACIÓN": "⚖️",
      "ACEPTADO": "✅",
      "DESCARTADO": "❌"
    };
    
    let texto = `📋 *LISTA DE POSTULANTES - SANILAB*\n`;
    texto += `📅 ${fecha} | Estado: "${nombreEstado}" | Período: ${nombrePeriodo}\n`;
    texto += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    texto += `Total: ${total} postulantes\n\n`;
    
    if (datos.length === 0) {
      texto += `No hay postulantes que coincidan con los filtros seleccionados.\n`;
    } else {
      datos.forEach((p, idx) => {
        const estadoEmoji = emojiEstado[p.estado_postulante] || "📌";
        texto += `${idx + 1}. ${p.nombre}\n`;
        texto += `   📱 ${p.telefono || "No especificado"} | 🎓 ${p.carrera}\n`;
        texto += `   🏢 ${p.area} | ${estadoEmoji} ${getNombreEstadoCorto(p.estado_postulante)}\n`;
        texto += `   📅 ${p.fecha_envio ? new Date(p.fecha_envio).toLocaleDateString('es-PE') : "Fecha no disponible"}\n`;
        if (idx < datos.length - 1) texto += `\n`;
      });
    }
    
    texto += `\n━━━━━━━━━━━━━━━━━━━━━━\n`;
    texto += `📱 Reporte generado desde GTH System\n`;
    
    return texto;
  };

  const getNombreEstadoCorto = (estado) => {
    const textos = {
      "NUEVO (FALTA AGENDAR)": "Nuevo",
      "CONTACTADO (SIN RESPUESTA)": "Contactado",
      "ENTREVISTA AGENDADA": "Entrevista",
      "EN EVALUACIÓN": "Evaluación",
      "ACEPTADO": "Aceptado",
      "DESCARTADO": "Descartado"
    };
    return textos[estado] || estado;
  };

  const handleCopiar = async () => {
    const texto = tipoReporte === "estadisticas" 
      ? generarTextoEstadisticas() 
      : generarTextoLista();
    await navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const { total } = generarEstadisticas();
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
        <i className="bi bi-info-circle"></i> Genera reportes para compartir por WhatsApp. Los datos se copian en formato texto plano.
      </div>
      
      {/* Pestañas de tipo de reporte */}
      <div className="btn-group mb-4 w-100" role="group">
        <button 
          className={`btn ${tipoReporte === "estadisticas" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setTipoReporte("estadisticas")}
        >
          📊 Estadísticas
        </button>
        <button 
          className={`btn ${tipoReporte === "lista" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setTipoReporte("lista")}
        >
          📋 Lista de postulantes
        </button>
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
          <h5>📄 Vista previa del reporte - {tipoReporte === "estadisticas" ? "Estadísticas" : "Lista detallada"}</h5>
        </div>
        <div className="card-body">
          <div className="bg-light p-3 rounded" style={{ fontFamily: "monospace", whiteSpace: "pre-wrap", maxHeight: "500px", overflowY: "auto" }}>
            {tipoReporte === "estadisticas" ? generarTextoEstadisticas() : generarTextoLista()}
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
              <small>con filtros actuales</small>
            </div>
          </div>
        </div>
        {ESTADOS_POSTULANTE.slice(0, 3).map(estado => {
          const { porEstado } = generarEstadisticas();
          return (
            <div key={estado.valor} className="col-md-3">
              <div className={`card bg-${estado.badge} bg-opacity-25`}>
                <div className="card-body">
                  <h6 className="card-title">{estado.label}</h6>
                  <h3>{porEstado[estado.valor] || 0}</h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}