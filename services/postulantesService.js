// services/postulantesService.js

const BASE_URL = process.env.NEXT_PUBLIC_SHEETDB_POSTULANTES_ANTIGUOS;
const SHEET = encodeURIComponent("Respuestas de formulario de postulación");

export async function getPostulantes() {
  try {
    const res = await fetch(`${BASE_URL}?sheet=${SHEET}`, {
      cache: "no-store",
    });
    
    if (!res.ok) throw new Error(`Error ${res.status}`);
    
    const json = await res.json();
    const data = Array.isArray(json) ? json : json.data || [];
    
    // Filtrar filas válidas
    const datosValidos = data.filter(item => {
      const tieneNombre = item["Nombre y apellidos"]?.trim();
      const tieneUniversidad = item["DatosFormateados - Institucion e Universidad"]?.trim();
      return tieneNombre || tieneUniversidad;
    });
    
    console.log(`📊 Total filas: ${data.length} | Válidas: ${datosValidos.length}`);
    
    return datosValidos.map((item, index) => ({
      id: index,
      fecha: item["Fecha"] || null,
      nombre: item["Nombre y apellidos"]?.trim() || "Sin nombre",
      carrera: item["¿De qué carrera eres?"]?.trim() || "No especificado",
      universidad: item["DatosFormateados - Institucion e Universidad"]?.trim() === "Sin relación" 
        ? "Universidad/Instituto no especificado" 
        : (item["DatosFormateados - Institucion e Universidad"]?.trim() || "No especificado"),
      area: item["¿Para qué área postulas?"]?.trim() || "No especificado",
      modalidad: item["¿Cuál sería tu modalidad de trabajo?"]?.trim() || "No especificado",
    }));
    
  } catch (error) {
    console.error("Error en getPostulantes:", error);
    return [];
  }
}