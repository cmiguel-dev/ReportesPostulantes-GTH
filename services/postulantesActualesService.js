// services/postulantesActualesService.js

const BASE_URL = process.env.NEXT_PUBLIC_SHEETDB_POSTULANTES_ACTUALES;
const SHEET_NAME = encodeURIComponent("Postulantes Actualizado");

export async function getPostulantesActuales(limite = null, offset = 0, filters = {}) {
  try {
    // Construir URL - SIN limit inicial para obtener todos y luego ordenar
    let url = `${BASE_URL}?sheet=${SHEET_NAME}`;
    
    const res = await fetch(url, {
      cache: "no-store",
    });
    
    if (!res.ok) throw new Error(`Error ${res.status}`);
    
    const json = await res.json();
    const data = Array.isArray(json) ? json : json.data || [];
    
    // Filtrar filas vacías
    const datosValidos = data.filter(item => {
      const tieneNombre = item["Nombre y apellidos"]?.trim();
      return tieneNombre;
    });
    
    // Mapear y normalizar los datos
    let postulantes = datosValidos.map((item, index) => {
      // Extraer ID de la columna "ID" en el Excel (con mayúsculas)
      let id = item["ID"] || index;
      // Convertir a número si es string
      if (typeof id === 'string') id = parseInt(id) || index;
      
      return {
        id: id,
        fecha_envio: item["Fecha de envio"] || null,
        fecha_postulacion: item["Fecha de envio"] ? new Date(item["Fecha de envio"]) : null,
        email: item["Correo electrónico"]?.trim() || "",
        nombre: item["Nombre y apellidos"]?.trim() || "Sin nombre",
        telefono: item["Teléfono"]?.trim() || "",
        edad: item["Edad"] || "",
        area: normalizarAreaPostulacion(item["¿A qué área postula?"]) || "No especificado",
        carrera: normalizarCarreraPostulante(item["¿De qué carrera o profesión eres?"]) || "No especificado",
        universidad: normalizarUniversidad(item["¿A qué institución o universidad perteneces?"]) || "No especificado",
        ciclo: item["¿En qué ciclo o nivel académico te encuentras?"] || "",
        distrito: item["Distrito"] || "",
        provincia: item["Provincia"] || "",
        pais: item["Pais"] || "Perú",
        direccion: item["Dirección del domicilio"] || "",
        trabaja_actualmente: item["Actualmente, ¿trabajas o participas de algún voluntariado o agrupación estudiantil?"] || "",
        medio_enteró: normalizarMedioEntero(item["¿Por que medio se enteró acerca de nuestra convocatoria?"]) || "No especificado",
        modalidad_postula: item["¿A cuál modalidad postula?"] || "",
        modalidad_trabajo: item["¿Cuál sería tu modalidad de trabajo?"] || "",
        beneficios_interes: item["¿Cuáles son los beneficios que más te interesan de esta experiencia en Sanilab?"] || "",
        linea_carrera: item["Línea de carrera: Que nivel desea llega?"] || "",
        experiencia_previa: item["¿Tienes alguna experiencia previa? Comenta brevemente si así fuera"] || "",
        linkedin: item["Coloque link de sus red social"] || "",
        cv_url: extraerCVUrl(item["Adjunta tu CV"]),
        cumplio_pasos: item["Cumplí con los pasos Antes de la entrevista"] || "No",
        observacion_rechazo: item["Observacion/ Razon de rechazo"] || "",
        estado_postulante: item["Estado de Postulante"] || "falta agendar"
      };
    });
    
    // ORDENAR POR ID DESCENDENTE (más reciente primero)
    // Esto asegura que los últimos registros (ID más alto) aparezcan primero
    postulantes.sort((a, b) => {
      const idA = typeof a.id === 'number' ? a.id : 0;
      const idB = typeof b.id === 'number' ? b.id : 0;
      return idB - idA; // Descendente
    });
    
    // Si hay límite, tomar los primeros N después del ordenamiento
    if (limite && limite !== 'all' && typeof limite === 'number') {
      const start = offset;
      const end = start + limite;
      postulantes = postulantes.slice(start, end);
    }
    
    // Aplicar filtros adicionales
    if (filters.estado && filters.estado !== 'todos') {
      postulantes = postulantes.filter(p => p.estado_postulante === filters.estado);
    }
    
    if (filters.fecha_inicio && filters.fecha_fin) {
      const fechaInicio = new Date(filters.fecha_inicio);
      const fechaFin = new Date(filters.fecha_fin);
      postulantes = postulantes.filter(p => {
        if (!p.fecha_postulacion) return false;
        return p.fecha_postulacion >= fechaInicio && p.fecha_postulacion <= fechaFin;
      });
    }
    
    console.log(`📊 Total postulantes actuales: ${datosValidos.length} | Mostrando: ${postulantes.length}`);
    
    return postulantes;
    
  } catch (error) {
    console.error("Error en getPostulantesActuales:", error);
    return [];
  }
}

// Funciones de normalización (igual que antes)
function normalizarAreaPostulacion(area = "") {
  if (!area || area === "No especificado") return "No especificado";
  
  const areasMap = {
    "gestión digital": "Gestión Digital",
    "sistema": "Gestión Digital",
    "digital": "Gestión Digital",
    "medio ambiente": "Medio Ambiente y ecología",
    "ambiental": "Medio Ambiente y ecología",
    "ecología": "Medio Ambiente y ecología",
    "marketing": "Marketing",
    "ventas": "Ventas",
    "operaciones": "Operaciones",
    "talento humano": "Talento Humano",
    "rrhh": "Talento Humano",
    "finanzas": "Finanzas",
    "contabilidad": "Finanzas",
    "logística": "Logística",
    "producción": "Producción"
  };
  
  const areaLower = area.toLowerCase().trim();
  for (const [key, value] of Object.entries(areasMap)) {
    if (areaLower.includes(key)) return value;
  }
  
  return area.trim();
}

function normalizarCarreraPostulante(carrera = "") {
  if (!carrera) return "No especificado";
  
  const carrerasMap = {
    "informática": "Ingeniería Informática",
    "sistemas": "Ingeniería de Sistemas",
    "software": "Ingeniería de Software",
    "industrial": "Ingeniería Industrial",
    "ambiental": "Ingeniería Ambiental",
    "administración": "Administración",
    "marketing": "Marketing",
    "comunicaciones": "Comunicaciones",
    "derecho": "Derecho",
    "psicología": "Psicología",
    "contabilidad": "Contabilidad"
  };
  
  const carreraLower = carrera.toLowerCase().trim();
  for (const [key, value] of Object.entries(carrerasMap)) {
    if (carreraLower.includes(key)) return value;
  }
  
  return carrera.trim();
}

function normalizarUniversidad(universidad = "") {
  if (!universidad) return "No especificado";
  
  const universidadesMap = {
    "ricardo palma": "Universidad Ricardo Palma",
    "upc": "UPC",
    "ulima": "Universidad de Lima",
    "pacifico": "Universidad del Pacífico",
    "católica": "PUCP",
    "san martín": "USMP",
    "científica": "Universidad Científica del Sur",
    "tecnológica del perú": "Universidad Tecnológica del Perú",
    "utp": "Universidad Tecnológica del Perú"
  };
  
  const uniLower = universidad.toLowerCase().trim();
  for (const [key, value] of Object.entries(universidadesMap)) {
    if (uniLower.includes(key)) return value;
  }
  
  return universidad.trim();
}

function normalizarMedioEntero(medio = "") {
  if (!medio) return "No especificado";
  
  if (Array.isArray(medio)) {
    medio = medio[0];
  }
  
  const mediosMap = {
    "facebook": "Facebook",
    "linkedin": "LinkedIn",
    "whatsapp": "WhatsApp",
    "instagram": "Instagram",
    "recomendación": "Recomendación",
    "universidad": "Universidad",
    "email": "Email",
    "página web": "Página web"
  };
  
  const medioLower = medio.toLowerCase().trim();
  for (const [key, value] of Object.entries(mediosMap)) {
    if (medioLower.includes(key)) return value;
  }
  
  return medio;
}

function extraerCVUrl(cvData) {
  if (!cvData) return null;
  
  try {
    if (typeof cvData === 'string') {
      if (cvData.startsWith('http')) return cvData;
      const parsed = JSON.parse(cvData);
      if (parsed && parsed.url) return parsed.url;
      if (Array.isArray(parsed) && parsed[0] && parsed[0].url) return parsed[0].url;
    } else if (Array.isArray(cvData) && cvData[0] && cvData[0].url) {
      return cvData[0].url;
    }
  } catch(e) {
    console.log("Error parsing CV URL:", e);
  }
  
  return null;
}