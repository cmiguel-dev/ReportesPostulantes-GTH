// services/onboardingService.js

const BASE_URL = process.env.NEXT_PUBLIC_SHEETDB_ONBOARDING;
const SHEET = encodeURIComponent("Base de datos/Acuerdo de compromiso");

// Obtener datos
export async function getOnboarding() {
  const res = await fetch(`${BASE_URL}?sheet=${SHEET}`, {
    cache: "no-store",
  });

  const json = await res.json();
  return Array.isArray(json) ? json : json.data;
}

// Crear
export async function createOnboarding(data) {
  return fetch(`${BASE_URL}?sheet=${SHEET}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data }),
  });
}

// 🔥 UPDATE POR ID (AHORA SÍ FUNCIONA)
export async function updateOnboarding(id, data) {
  return fetch(`${BASE_URL}/id/${id}?sheet=${SHEET}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data }),
  });
}