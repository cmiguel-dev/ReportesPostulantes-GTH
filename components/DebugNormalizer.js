// components/DebugNormalizer.js

"use client";

import { useState } from "react";
import { normalizarUniversidad, getEstadisticasNormalizacion } from "../utils/normalizers";

export default function DebugNormalizer({ data }) {
  const [showDebug, setShowDebug] = useState(false);

  if (!showDebug) {
    return (
      <button 
        className="btn btn-secondary btn-sm mt-3"
        onClick={() => setShowDebug(true)}
      >
        🐛 Ver estadísticas de normalización
      </button>
    );
  }

  const stats = getEstadisticasNormalizacion(data);
  
  // Mostrar ejemplos de normalización
  const ejemplos = data
    .filter(item => item.universidad_original && item.universidad_original !== 'No especificado')
    .slice(0, 15)
    .map(item => ({
      original: item.universidad_original,
      normalizado: normalizarUniversidad(item.universidad_original)
    }));

  return (
    <div className="alert alert-info mt-3">
      <div className="d-flex justify-content-between align-items-center">
        <strong>📊 Estadísticas de normalización</strong>
        <button 
          className="btn-close" 
          onClick={() => setShowDebug(false)}
        ></button>
      </div>
      
      <div className="mt-2">
        <p><strong>Total registros:</strong> {stats.total}</p>
        <p><strong>✅ Normalizados correctamente:</strong> {stats.normalizados}</p>
        <p><strong>⚠️ No normalizados:</strong> {stats.noNormalizados}</p>
      </div>
      
      {stats.ejemplosNoNormalizados.length > 0 && (
        <>
          <hr />
          <strong>📝 Textos que necesitan reglas:</strong>
          <ul className="mt-2">
            {stats.ejemplosNoNormalizados.map((texto, idx) => (
              <li key={idx}>"{texto}"</li>
            ))}
          </ul>
        </>
      )}
      
      <hr />
      <strong>✨ Ejemplos de normalización:</strong>
      <div className="table-responsive mt-2">
        <table className="table table-sm table-bordered">
          <thead>
            <tr><th>Original</th><th>Normalizado</th></tr>
          </thead>
          <tbody>
            {ejemplos.map((ej, idx) => (
              <tr key={idx}>
                <td style={{maxWidth: '300px', wordWrap: 'break-word'}}>{ej.original}</td>
                <td>{ej.normalizado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}