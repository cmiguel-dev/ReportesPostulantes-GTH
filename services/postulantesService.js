// services/postulantesService.js

const BASE_URL = process.env.NEXT_PUBLIC_SHEETDB_POSTULANTES_ANTIGUOS;
const SHEET = encodeURIComponent("Respuestas de formulario de postulación");

export async function getPostulantes() {
  const res = await fetch(`${BASE_URL}?sheet=${SHEET}`, {
    cache: "no-store",
  });

  const json = await res.json();
  const data = Array.isArray(json) ? json : json.data;

  return data.map((item) => ({
    fecha: item["Fecha"] || null,
    nombre: item["Nombre y apellidos"] || "Sin nombre",
    carrera: item["¿De qué carrera eres?"] || "No especificado",
    universidad: item["¿A qué institución o universidad perteneces?"] || "No especificado",
    area: item["¿Para qué área postulas?"] || "No especificado",
    modalidad: item["¿Cuál sería tu modalidad de trabajo?"] || "No especificado",
    // Guardar original para depuración (opcional)
    universidad_original: item["¿A qué institución o universidad perteneces?"] || null,
  }));
}