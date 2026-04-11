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
    
    // Filtrar filas VÁLIDAS (que tengan al menos nombre o universidad)
    const datosValidos = data.filter(item => {
      const tieneNombre = item["Nombre y apellidos"] && 
                         item["Nombre y apellidos"].trim() !== "";
      const tieneUniversidad = item["¿A qué institución o universidad perteneces?"] && 
                              item["¿A qué institución o universidad perteneces?"].trim() !== "";
      
      return tieneNombre || tieneUniversidad;
    });
    
    console.log(`📊 Total filas originales: ${data.length}`);
    console.log(`✅ Filas válidas: ${datosValidos.length}`);
    console.log(`🗑️ Filas vacías eliminadas: ${data.length - datosValidos.length}`);
    
    return datosValidos.map((item, index) => ({
      id: index,
      fecha: item["Fecha"] || null,
      nombre: item["Nombre y apellidos"]?.trim() || "Sin nombre",
      carrera: item["¿De qué carrera eres?"]?.trim() || "No especificado",
      universidad: item["¿A qué institución o universidad perteneces?"]?.trim() || "No especificado",
      universidad_original: item["¿A qué institución o universidad perteneces?"]?.trim() || null,
      area: item["¿Para qué área postulas?"]?.trim() || "No especificado",
      modalidad: item["¿Cuál sería tu modalidad de trabajo?"]?.trim() || "No especificado",
    }));
    
  } catch (error) {
    console.error("Error en getPostulantes:", error);
    return [];
  }
}