// components/DebugNormalizer.js

"use client";

import { useState } from "react";
import { normalizarUniversidad } from "../utils/normalizers";

export default function DebugNormalizer({ data }) {
  const [showDebug, setShowDebug] = useState(false);

  if (!showDebug) {
    return (
      <button 
        className="btn btn-secondary btn-sm mt-3"
        onClick={() => setShowDebug(true)}
      >
        🐛 Ver problemas de normalización
      </button>
    );
  }

  const problemas = data
    .filter(item => {
      const normalizado = normalizarUniversidad(item.universidad);
      return item.universidad !== normalizado && 
             !normalizado.includes("Universidad") && 
             !normalizado.includes("Instituto") &&
             item.universidad !== "No especificado";
    })
    .slice(0, 20); // Mostrar solo primeros 20

  return (
    <div className="alert alert-warning mt-3">
      <div className="d-flex justify-content-between">
        <strong>⚠️ Textos que no se normalizaron correctamente</strong>
        <button 
          className="btn-close" 
          onClick={() => setShowDebug(false)}
        ></button>
      </div>
      <ul className="mt-2">
        {problemas.map((item, idx) => (
          <li key={idx}>
            <strong>Original:</strong> {item.universidad}<br />
            <strong>Normalizado:</strong> {normalizarUniversidad(item.universidad)}
            <hr />
          </li>
        ))}
      </ul>
      {problemas.length === 0 && <p>✅ Todos los textos se normalizan bien</p>}
    </div>
  );
}