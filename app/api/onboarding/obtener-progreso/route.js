// app/api/onboarding/obtener-progreso/route.js
//
// La llama el código Velo de la página de Wix "Bienvenido al Onboarding" cuando
// la persona escribe su DNI. Ningún archivo de este repositorio la invoca.

import {
  buscarPorDni,
  forzarTexto,
  leerJson,
  normalizarDni,
} from "../../../../utils/sheetdb";

const SHEET_PROGRESO = encodeURIComponent("onboarding_progreso");
const SHEET_ACUERDO = encodeURIComponent("Base de datos/Acuerdo de compromiso");
const COLUMNA_DNI_ACUERDO = "DNI (Documento de Identificación)";

const API_URL = process.env.NEXT_PUBLIC_SHEETDB_ONBOARDING;

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://www.sanilabperu.com",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dni = normalizarDni(searchParams.get("dni"));

    if (!dni) {
      return new Response(JSON.stringify({ error: "DNI requerido" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    console.log("[Obtener] Buscando DNI:", dni);

    // 1. BUSCAR EN ONBOARDING_PROGRESO

    const progresoRes = await fetch(`${API_URL}?sheet=${SHEET_PROGRESO}`);

    const progresoData = await leerJson(progresoRes);

    // Fallar en voz alta: tratar un error como "no tiene fila" le crearía una
    // segunda a quien sí la tenía.
    if (!progresoRes.ok || !Array.isArray(progresoData)) {
      throw new Error(
        `SheetDB no devolvió onboarding_progreso (HTTP ${progresoRes.status})`,
      );
    }

    let usuario = buscarPorDni(progresoData, "dni", dni);

    // 2. SI NO EXISTE -> BUSCAR EN ACUERDO

    if (!usuario) {
      console.log("[Obtener] No existe en onboarding_progreso");

      const acuerdoRes = await fetch(`${API_URL}?sheet=${SHEET_ACUERDO}`);

      const acuerdoData = await leerJson(acuerdoRes);

      if (!acuerdoRes.ok || !Array.isArray(acuerdoData)) {
        throw new Error(
          `SheetDB no devolvió la hoja del acuerdo (HTTP ${acuerdoRes.status})`,
        );
      }

      const empleado = buscarPorDni(acuerdoData, COLUMNA_DNI_ACUERDO, dni);

      if (!empleado) {
        console.log(
          "[Obtener] DNI no encontrado en Base de datos/Acuerdo de compromiso",
        );

        return new Response(
          JSON.stringify({
            error: "DNI no encontrado",
          }),
          {
            status: 404,
            headers: corsHeaders,
          },
        );
      }

      const nuevoRegistro = {
        dni,
        nombre: empleado["Nombre y Apellidos"] || "",
        carrera: empleado["Carrera"] || "",
        universidad: empleado["Centro de estudios"] || "",
        celular: String(empleado["Número de celular"] ?? "").trim(),
        area: empleado["Área a la que ingresaras(mencionada en la entrevista) "] || "",
        fecha_inicio: empleado["Escribir fecha de inicio en la empresa (acordado en la entrevista)"] || "",
        paso1: "pendiente",
        paso2: "pendiente",
        paso3: "pendiente",
        paso4: "pendiente",
        paso5: "pendiente",
        paso6: "pendiente",
        paso7: "pendiente",
        paso8: "pendiente",
        paso9: "pendiente",
        ultima_actualizacion: new Date().toLocaleString("es-PE", {
          timeZone: "America/Lima",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      };

      console.log("[Obtener] Creando fila automática:", nuevoRegistro);

      // NO incluir `id`: lo genera una ARRAYFORMULA y escribirlo la rompe para
      // toda la hoja. Ver utils/sheetdb.js.
      const creacionRes = await fetch(`${API_URL}?sheet=${SHEET_PROGRESO}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Forzados a texto solo al ESCRIBIR. `nuevoRegistro` conserva los
          // valores limpios porque son los que se devuelven a Wix, y el DNI con
          // apóstrofo no lo encontraría ninguna búsqueda posterior.
          data: {
            ...nuevoRegistro,
            dni: forzarTexto(dni),
            celular: forzarTexto(nuevoRegistro.celular),
          },
        }),
      });

      // Si la creación falla, la persona puede continuar igual: su primer
      // "Enviar Respuesta" crea la fila. Se registra el fallo pero no se
      // reintenta aquí — un reintento gastaría cuota y podría duplicar la fila.
      if (!creacionRes.ok) {
        console.error(
          "[Obtener] No se pudo crear la fila:",
          creacionRes.status,
          await leerJson(creacionRes),
        );
      }

      usuario = nuevoRegistro;
    }

    // 3. DEVOLVER PROGRESO

    const progreso = {
      paso1: usuario.paso1 || "pendiente",
      paso2: usuario.paso2 || "pendiente",
      paso3: usuario.paso3 || "pendiente",
      paso4: usuario.paso4 || "pendiente",
      paso5: usuario.paso5 || "pendiente",
      paso6: usuario.paso6 || "pendiente",
      paso7: usuario.paso7 || "pendiente",
      paso8: usuario.paso8 || "pendiente",
      paso9: usuario.paso9 || "pendiente",
    };

    console.log("[Obtener] Progreso encontrado:", progreso);

    return new Response(
      JSON.stringify({
        // El DNI tal y como está en la hoja, no como lo tecleó la persona: es el
        // valor con el que guardar-progreso localizará la fila después.
        dni: usuario.dni,
        nombre: usuario.nombre || "",
        carrera: usuario.carrera || "",
        universidad: usuario.universidad || "",
        celular: usuario.celular || "",
        area: usuario.area || "",
        fecha_inicio: usuario.fecha_inicio || "",
        progreso,
      }),
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("[Obtener] Error:", error);

    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
