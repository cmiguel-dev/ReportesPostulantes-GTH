// utils/normalizersCampos.js

// Normalización de Áreas
const areasMap = {
  "ambiente": "Ambiente",
  "medio ambiente": "Ambiente",
  "gestion ambiental": "Ambiente",
  "ambiental": "Ambiente",
  
  "proyectos": "Proyectos",
  "gestion de proyectos": "Proyectos",
  "project": "Proyectos",
  
  "talento humano": "Talento Humano",
  "gestion de talento humano": "Talento Humano",
  "rrhh": "Talento Humano",
  "recursos humanos": "Talento Humano",
  
  "marketing": "Marketing",
  "marketing y publicidad": "Marketing",
  "publicidad": "Marketing",
  
  "salud": "Salud",
  "salud ocupacional": "Salud",
  
  "infraestructura": "Infraestructura",
  "construccion": "Infraestructura",
  
  "otro": "Otros",
  "otros": "Otros",
};

// Normalización de Carreras
const carrerasMap = {
  "ingeniería ambiental": "Ingeniería Ambiental",
  "ingenieria ambiental": "Ingeniería Ambiental",
  "ing. ambiental": "Ingeniería Ambiental",
  "ambiental": "Ingeniería Ambiental",
  
  "ingeniería industrial": "Ingeniería Industrial",
  "ingenieria industrial": "Ingeniería Industrial",
  "ing. industrial": "Ingeniería Industrial",
  
  "ingeniería química": "Ingeniería Química",
  "ingenieria quimica": "Ingeniería Química",
  "ing. quimica": "Ingeniería Química",
  
  "administración": "Administración",
  "administracion": "Administración",
  "administración industrial": "Administración Industrial",
  "administracion industrial": "Administración Industrial",
  
  "arquitectura": "Arquitectura",
  "arquitecto": "Arquitectura",
  
  "biología": "Biología",
  "biologia": "Biología",
  
  "psicología": "Psicología",
  "psicologia": "Psicología",
  
  "derecho": "Derecho",
  "antropología": "Antropología",
  "antropologia": "Antropología",
  "desarrollo de software": "Desarrollo de Software",
  "software": "Desarrollo de Software",
};

export function normalizarArea(area = "") {
  if (!area || area === "No especificado") return "No especificado";
  
  const areaLower = area.toLowerCase().trim();
  
  for (const [key, value] of Object.entries(areasMap)) {
    if (areaLower.includes(key)) {
      return value;
    }
  }
  
  return area.trim();
}

export function normalizarCarrera(carrera = "") {
  if (!carrera || carrera === "No especificado") return "No especificado";
  
  const carreraLower = carrera.toLowerCase().trim();
  
  for (const [key, value] of Object.entries(carrerasMap)) {
    if (carreraLower.includes(key)) {
      return value;
    }
  }
  
  return carrera.trim();
}