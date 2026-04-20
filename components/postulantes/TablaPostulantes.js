// components/postulantes/TablaPostulantes.js

"use client";

import EditorEstado from "./EditorEstado";

export default function TablaPostulantes({
  currentItems,
  indexOfFirstItem,
  onEstadoActualizado
}) {
  const getEstadoBadge = (estado) => {
    const badges = {
      "NUEVO (FALTA AGENDAR)": "warning",
      "CONTACTADO (SIN RESPUESTA)": "secondary",
      "ENTREVISTA AGENDADA": "info",
      "EN EVALUACIÓN": "primary",
      "ACEPTADO": "success",
      "DESCARTADO": "danger"
    };
    return badges[estado] || "secondary";
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      "NUEVO (FALTA AGENDAR)": "🆕 Nuevo (Falta agendar)",
      "CONTACTADO (SIN RESPUESTA)": "📞 Contactado (Sin respuesta)",
      "ENTREVISTA AGENDADA": "📅 Entrevista agendada",
      "EN EVALUACIÓN": "⚖️ En evaluación",
      "ACEPTADO": "✅ Aceptado",
      "DESCARTADO": "❌ Descartado"
    };
    return textos[estado] || estado;
  };

  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>ID</th>
            <th>Fecha</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Área</th>
            <th>Carrera</th>
            <th>Universidad</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((postulante, idx) => (
            <tr key={postulante.id}>
              <td>{indexOfFirstItem + idx + 1}</td>
              <td><strong>{postulante.id}</strong></td>
              <td>{postulante.fecha_envio ? new Date(postulante.fecha_envio).toLocaleDateString('es-PE') : '-'}</td>
              <td>{postulante.nombre}</td>
              <td>{postulante.telefono}</td>
              <td>{postulante.email}</td>
              <td>{postulante.area}</td>
              <td>{postulante.carrera}</td>
              <td>{postulante.universidad}</td>
              <td>
                <EditorEstado 
                  postulante={postulante}
                  onEstadoActualizado={onEstadoActualizado}
                />
              </td>
              <td>
                <button 
                  className="btn btn-sm btn-info"
                  data-bs-toggle="modal"
                  data-bs-target={`#modal-${postulante.id}`}
                >
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}