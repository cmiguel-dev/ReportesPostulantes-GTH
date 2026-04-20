// components/postulantes/EditorEstado.js
"use client";

import { useState } from "react";
import { ESTADOS_POSTULANTE, actualizarEstadoPostulante } from "../../services/postulantesActualesService";

export default function EditorEstado({ postulante, onEstadoActualizado }) {
  const [estadoActual, setEstadoActual] = useState(postulante.estado_postulante);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

  const handleCambioEstado = async (nuevoEstado) => {
    if (nuevoEstado === estadoActual) return;
    
    setActualizando(true);
    setError("");
    
    // Usar el id directamente (como en onboarding)
    const result = await actualizarEstadoPostulante(postulante.id, nuevoEstado);
    
    if (result.success) {
      setEstadoActual(nuevoEstado);
      onEstadoActualizado(postulante.id, nuevoEstado);
    } else {
      setError("Error al actualizar");
      console.error(result.error);
    }
    
    setActualizando(false);
  };

  const getBadgeColor = (estado) => {
    const estadoObj = ESTADOS_POSTULANTE.find(e => e.valor === estado);
    return estadoObj ? estadoObj.badge : "secondary";
  };

  return (
    <div>
      <select
        className={`form-select form-select-sm bg-${getBadgeColor(estadoActual)} bg-opacity-25`}
        value={estadoActual}
        onChange={(e) => handleCambioEstado(e.target.value)}
        disabled={actualizando}
        style={{ minWidth: "180px", fontSize: "0.85rem" }}
      >
        {ESTADOS_POSTULANTE.map((estado) => (
          <option key={estado.valor} value={estado.valor}>
            {estado.label}
          </option>
        ))}
      </select>
      {actualizando && <small className="text-muted d-block">Actualizando...</small>}
      {error && <small className="text-danger d-block">{error}</small>}
    </div>
  );
}