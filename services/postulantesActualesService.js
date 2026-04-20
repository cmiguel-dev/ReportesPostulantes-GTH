// services/postulantesActualesService.js
const BASE_URL = process.env.NEXT_PUBLIC_SHEETDB_POSTULANTES_ACTUALES;
const SHEET_NAME = encodeURIComponent("Postulantes Actualizado");

export const ESTADOS_POSTULANTE = [
  { valor: "NUEVO (FALTA AGENDAR)", label: "🆕 Nuevo (Falta agendar)", badge: "warning" },
  { valor: "CONTACTADO (SIN RESPUESTA)", label: "📞 Contactado (Sin respuesta)", badge: "secondary" },
  { valor: "ENTREVISTA AGENDADA", label: "📅 Entrevista agendada", badge: "info" },
  { valor: "EN EVALUACIÓN", label: "⚖️ En evaluación", badge: "primary" },
  { valor: "ACEPTADO", label: "✅ Aceptado", badge: "success" },
  { valor: "DESCARTADO", label: "❌ Descartado", badge: "danger" }
];

export async function getPostulantesActuales() {
  try {
    const url = `${BASE_URL}?sheet=${SHEET_NAME}`;
    
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
      // Usar el campo "id" de la hoja (minúsculas)
      const idHoja = item.id || item["id"] || index + 1;
      
      // Obtener estado del Excel o asignar "NUEVO (FALTA AGENDAR)" si está vacío
      let estadoExcel = item["Estado de Postulante"] || "";
      let estadoInterno = estadoExcel.trim() === "" ? "NUEVO (FALTA AGENDAR)" : estadoExcel;
      
      return {
        id: idHoja,  // ID para actualizaciones
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
        estado_postulante: estadoInterno
      };
    });
    
    // ORDENAR POR ID DESCENDENTE (número más alto primero)
    postulantes.sort((a, b) => {
      return b.id - a.id;
    });
    
    console.log(`📊 Total postulantes: ${postulantes.length}`);
    console.log(`📝 IDs: ${postulantes.slice(0, 5).map(p => p.id).join(', ')}...`);
    
    return postulantes;
    
  } catch (error) {
    console.error("Error en getPostulantesActuales:", error);
    return [];
  }
}

// ACTUALIZAR estado usando /id/ (como en onboarding)
export async function actualizarEstadoPostulante(id, nuevoEstado) {
  try {
    // Esta es la URL correcta: /id/{id}?sheet=Nombre
    const updateUrl = `${BASE_URL}/id/${id}?sheet=${SHEET_NAME}`;
    
    console.log(`🔄 Actualizando ID: ${id} a estado: ${nuevoEstado}`);
    
    const response = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          "Estado de Postulante": nuevoEstado
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error ${response.status}: ${errorText}`);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`✅ Estado actualizado para ID ${id}: ${nuevoEstado}`);
    return { success: true, data: result };
    
  } catch (error) {
    console.error("Error actualizando estado:", error);
    return { success: false, error: error.message };
  }
}

// Resto de funciones de normalización (igual que antes)
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