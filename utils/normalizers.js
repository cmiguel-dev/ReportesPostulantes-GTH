// utils/normalizers.js

import universidadesData from './universidades.json';

// Cargar y procesar datos una sola vez
const universidadesDB = (() => {
  const db = new Map(); // Para búsqueda rápida
  
  universidadesData.universidades.forEach(uni => {
    // Guardar por nombre completo con siglas
    const nombreMostrar = uni.siglas ? `${uni.nombre} (${uni.siglas})` : uni.nombre;
    
    uni.variantes.forEach(variante => {
      db.set(variante.toLowerCase(), nombreMostrar);
    });
    
    // También guardar el nombre limpio
    db.set(uni.nombre.toLowerCase(), nombreMostrar);
    if (uni.siglas) {
      db.set(uni.siglas.toLowerCase(), nombreMostrar);
    }
  });
  
  return db;
})();

// Palabras a ignorar
const STOP_WORDS = [
  'estudio', 'estudiando', 'en', 'la', 'el', 'los', 'las',
  'de', 'del', 'y', 'soy', 'estoy', 'alumno', 'alumna',
  'universitario', 'universitaria', 'institución', 'instituto',
  'soy', 'un', 'una', 'que', 'como', 'por', 'para', 'con',
  'mi', 'tu', 'su', 'mis', 'tus', 'sus'
];

function limpiarTexto(texto) {
  if (!texto || texto === 'No especificado') return '';
  
  // 1. Convertir a minúsculas y trim
  let limpio = texto.toLowerCase().trim();
  
  // 2. Eliminar signos de puntuación
  limpio = limpio.replace(/[.,;:!?¿¡()\-_]/g, '');
  
  // 3. Eliminar palabras basura
  STOP_WORDS.forEach(palabra => {
    const regex = new RegExp(`\\b${palabra}\\b`, 'g');
    limpio = limpio.replace(regex, '');
  });
  
  // 4. Eliminar espacios múltiples
  limpio = limpio.replace(/\s+/g, ' ').trim();
  
  return limpio;
}

export function normalizarUniversidad(texto = '') {
  // Casos especiales
  if (!texto || texto === 'No especificado' || texto.trim() === '') {
    return 'No especificado';
  }
  
  const textoLimpio = limpiarTexto(texto);
  if (textoLimpio.length === 0) return 'No especificado';
  
  // Buscar coincidencia exacta
  if (universidadesDB.has(textoLimpio)) {
    return universidadesDB.get(textoLimpio);
  }
  
  // Buscar coincidencia parcial (para textos largos como "Estudio en SENATI")
  for (const [key, value] of universidadesDB.entries()) {
    if (textoLimpio.includes(key) || key.includes(textoLimpio)) {
      return value;
    }
  }
  
  // Si no encuentra, devolver el texto original limpio
  return texto.trim();
}

// Función para debug
export function getEstadisticasNormalizacion(data) {
  const stats = {
    total: data.length,
    normalizados: 0,
    noNormalizados: 0,
    ejemplosNoNormalizados: []
  };
  
  data.forEach(item => {
    const original = item.universidad_original || item.universidad;
    const normalizado = normalizarUniversidad(original);
    
    if (normalizado !== original && normalizado !== 'No especificado') {
      stats.normalizados++;
    } else if (original && original !== 'No especificado') {
      stats.noNormalizados++;
      if (stats.ejemplosNoNormalizados.length < 10) {
        stats.ejemplosNoNormalizados.push(original);
      }
    }
  });
  
  return stats;
}