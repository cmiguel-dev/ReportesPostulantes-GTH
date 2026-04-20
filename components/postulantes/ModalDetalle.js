// components/postulantes/ModalDetalle.js
"use client";

export default function ModalDetalle({ postulante }) {
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
    <div className="modal fade" id={`modal-${postulante.id}`} tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Detalles del Postulante - ID: {postulante.id}</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-6">
                <p><strong>📅 Fecha:</strong> {postulante.fecha_envio ? new Date(postulante.fecha_envio).toLocaleString('es-PE') : '-'}</p>
                <p><strong>👤 Nombre:</strong> {postulante.nombre}</p>
                <p><strong>📧 Email:</strong> {postulante.email}</p>
                <p><strong>📱 Teléfono:</strong> {postulante.telefono}</p>
                <p><strong>🎂 Edad:</strong> {postulante.edad}</p>
                <p><strong>📍 Ubicación:</strong> {postulante.distrito}, {postulante.provincia}, {postulante.pais}</p>
                <p><strong>📌 Estado:</strong> {getEstadoTexto(postulante.estado_postulante)}</p>
              </div>
              <div className="col-md-6">
                <p><strong>🏢 Área:</strong> {postulante.area}</p>
                <p><strong>🎓 Carrera:</strong> {postulante.carrera}</p>
                <p><strong>🏫 Universidad:</strong> {postulante.universidad}</p>
                <p><strong>📚 Ciclo:</strong> {postulante.ciclo}</p>
                <p><strong>💼 Modalidad:</strong> {postulante.modalidad_trabajo}</p>
                <p><strong>📢 Se enteró por:</strong> {postulante.medio_enteró}</p>
              </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-12">
                <p><strong>💼 Experiencia previa:</strong> {postulante.experiencia_previa || "No especifica"}</p>
                <p><strong>🔗 LinkedIn:</strong> {postulante.linkedin ? <a href={postulante.linkedin} target="_blank" rel="noopener noreferrer">Ver perfil</a> : "No especifica"}</p>
                {postulante.cv_url && (
                  <p><strong>📄 CV:</strong> <a href={postulante.cv_url} target="_blank" rel="noopener noreferrer">Descargar CV</a></p>
                )}
                <p><strong>✅ Cumplió pasos:</strong> {postulante.cumplio_pasos}</p>
                {postulante.observacion_rechazo && (
                  <p><strong>⚠️ Observación:</strong> {postulante.observacion_rechazo}</p>
                )}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}