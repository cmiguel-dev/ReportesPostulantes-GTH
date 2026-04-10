// utils/normalizers.js

// Diccionario principal de universidades e institutos del Perú
const universidadesMap = {
  // San Marcos
  "unmsm": "Universidad Nacional Mayor de San Marcos",
  "universidad nacional mayor de san marcos": "Universidad Nacional Mayor de San Marcos",
  "san marcos": "Universidad Nacional Mayor de San Marcos",
  
  // Ricardo Palma
  "urp": "Universidad Ricardo Palma",
  "universidad ricardo palma": "Universidad Ricardo Palma",
  "ricardo palma": "Universidad Ricardo Palma",
  
  // Católica Sedes Sapientiae
  "ucss": "Universidad Católica Sedes Sapientiae",
  "universidad catolica sedes sapientiae": "Universidad Católica Sedes Sapientiae",
  "sedes sapientiae": "Universidad Católica Sedes Sapientiae",
  
  // PUCP
  "pucp": "Pontificia Universidad Católica del Perú",
  "pontificia universidad catolica del peru": "Pontificia Universidad Católica del Perú",
  "catolica del peru": "Pontificia Universidad Católica del Perú",
  
  // UPN
  "upn": "Universidad Privada del Norte",
  "universidad privada del norte": "Universidad Privada del Norte",
  
  // Senati
  "senati": "SENATI",
  "senati institute": "SENATI",
  "instituto senati": "SENATI",
  
  // Universidad de Lima
  "ulima": "Universidad de Lima",
  "universidad de lima": "Universidad de Lima",
  
  // Universidad San Ignacio de Loyola
  "usil": "Universidad San Ignacio de Loyola",
  "universidad san ignacio de loyola": "Universidad San Ignacio de Loyola",
  "san ignacio de loyola": "Universidad San Ignacio de Loyola",
  
  // Universidad Peruana de Ciencias Aplicadas
  "upc": "Universidad Peruana de Ciencias Aplicadas",
  "universidad peruana de ciencias aplicadas": "Universidad Peruana de Ciencias Aplicadas",
  
  // Universidad Nacional de Ingeniería
  "uni": "Universidad Nacional de Ingeniería",
  "universidad nacional de ingenieria": "Universidad Nacional de Ingeniería",
  
  // Universidad ESAN
  "esan": "Universidad ESAN",
  "universidad esan": "Universidad ESAN",
  
  // Universidad del Pacífico
  "up": "Universidad del Pacífico",
  "universidad del pacifico": "Universidad del Pacífico",
  
  // Universidad César Vallejo
  "ucv": "Universidad César Vallejo",
  "universidad cesar vallejo": "Universidad César Vallejo",
  "cesar vallejo": "Universidad César Vallejo",
  
  // Universidad Alas Peruanas
  "uap": "Universidad Alas Peruanas",
  "universidad alas peruanas": "Universidad Alas Peruanas",
  
  // Instituto SISE
  "sise": "Instituto SISE",
  "instituto sise": "Instituto SISE",
  
  // Instituto Toulouse Lautrec
  "toulouse lautrec": "Instituto Toulouse Lautrec",
  "toulouse": "Instituto Toulouse Lautrec",
  
  // CIBERTEC
  "cibertec": "CIBERTEC",
  "instituto cibertec": "CIBERTEC",
  
  // IDAT
  "idat": "IDAT",
  "instituto idat": "IDAT",
  
  // Tecsup
  "tecsup": "Tecsup",
  "instituto tecsup": "Tecsup",
};

// Palabras comunes que se deben eliminar (stop words)
const palabrasBasura = [
  "estudio", "estudiando", "en", "la", "el", "los", "las",
  "de", "del", "y", "soy", "estoy", "alumno", "alumna",
  "universitario", "universitaria", "institución", "instituto"
];

function limpiarTexto(texto) {
  if (!texto) return "";
  
  // 1. Convertir a minúsculas
  let limpio = texto.toLowerCase().trim();
  
  // 2. Eliminar signos de puntuación
  limpio = limpio.replace(/[.,;:!?¿¡()]/g, "");
  
  // 3. Eliminar palabras basura
  palabrasBasura.forEach(palabra => {
    const regex = new RegExp(`\\b${palabra}\\b`, 'g');
    limpio = limpio.replace(regex, "");
  });
  
  // 4. Eliminar espacios extra
  limpio = limpio.replace(/\s+/g, " ").trim();
  
  return limpio;
}

function extraerNombreUniversidad(texto) {
  if (!texto) return "";
  
  const limpio = limpiarTexto(texto);
  const palabras = limpio.split(" ");
  
  // Buscar coincidencias exactas en el diccionario
  if (universidadesMap[limpio]) {
    return universidadesMap[limpio];
  }
  
  // Buscar por palabras clave (ej: "san marcos" dentro de texto más largo)
  for (const [key, value] of Object.entries(universidadesMap)) {
    if (limpio.includes(key)) {
      return value;
    }
  }
  
  // Si no encuentra, devolver texto original limpio
  return texto.trim();
}

export function normalizarUniversidad(nombre = "") {
  if (!nombre || nombre === "No especificado") return "No especificado";
  
  const nombreLimpio = limpiarTexto(nombre);
  
  // Casos especiales: respuestas muy cortas
  if (nombreLimpio.length < 3) return nombre.trim();
  
  const normalizado = extraerNombreUniversidad(nombre);
  
  // Si el resultado sigue siendo muy largo, intentar una segunda pasada
  if (normalizado.length > 50 && nombre.includes(" ")) {
    // Buscar si contiene alguna universidad conocida
    for (const [key, value] of Object.entries(universidadesMap)) {
      if (nombre.toLowerCase().includes(key)) {
        return value;
      }
    }
  }
  
  return normalizado;
}

// Función para depuración (ver qué textos no se normalizan)
export function analizarNormalizacion(data) {
  const problemas = [];
  
  data.forEach(item => {
    const original = item.universidad;
    const normalizado = normalizarUniversidad(original);
    
    if (original !== normalizado && !normalizado.includes("Universidad") && !normalizado.includes("Instituto")) {
      problemas.push({ original, normalizado });
    }
  });
  
  return problemas;
}