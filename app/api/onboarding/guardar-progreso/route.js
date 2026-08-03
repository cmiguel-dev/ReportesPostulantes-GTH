// app/api/onboarding/guardar-progreso/route.js
//
// La llama el código Velo de la página de Wix "Bienvenido al Onboarding"
// (paso 3 del flujo de postulación), una vez por cada uno de los 9 botones
// "Enviar Respuesta". Ningún archivo de este repositorio la invoca.

import {
  ahoraEnLima,
  forzarTexto,
  leerJson,
  normalizarDni,
  variantesDni,
} from "../../../../utils/sheetdb";

const SHEET_PROGRESO = encodeURIComponent("onboarding_progreso");
const API_URL = process.env.NEXT_PUBLIC_SHEETDB_ONBOARDING;

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://www.sanilabperu.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function responder(cuerpo, status) {
  return new Response(JSON.stringify(cuerpo), { status, headers: corsHeaders });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('[Guardar] Recibido:', body);

    const { dni, nombre, carrera, universidad, celular, area, fecha_inicio, paso1, paso2, paso3, paso4, paso5, paso6, paso7, paso8, paso9} = body;

    // Un DNI vacío coincidiría con la fila que solo lleva el aviso
    // "NO ELIMINAR ESTA CELDA" y escribiría en ella.
    const dniLimpio = normalizarDni(dni);

    if (!dniLimpio) {
      console.warn('[Guardar] Petición sin DNI, se descarta');
      return responder({ error: "DNI requerido" }, 400);
    }

    const ultima_actualizacion = ahoraEnLima();

    // Se filtra por `dni` y no por `id`: el `id` lo genera una ARRAYFORMULA que
    // solo lo rellena si la fila tiene nombre, así que las filas insertadas a
    // mano no lo tienen y nunca llegaban a guardarse.
    //
    // Se prueban las formas equivalentes del DNI antes de darlo por inexistente:
    // Wix envía el DNI tecleado y la hoja puede tenerlo sin su cero inicial, y
    // un 404 aquí crearía una fila duplicada.
    for (const variante of variantesDni(dniLimpio)) {
      const patchRes = await fetch(
        `${API_URL}/dni/${encodeURIComponent(variante)}?sheet=${SHEET_PROGRESO}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: {
              paso1, paso2, paso3, paso4, paso5, paso6, paso7, paso8, paso9,
              ultima_actualizacion
            }
          })
        }
      );

      const patchData = await leerJson(patchRes);

      if (patchRes.ok && patchData?.updated > 0) {
        console.log('[Guardar] Fila actualizada para DNI:', variante, patchData);
        return responder({ success: true, accion: "actualizado", data: patchData }, 200);
      }

      // Solo el 404 significa "no existe". Tratar cualquier otro fallo como
      // ausencia duplicaría la fila en cada reintento, y los fallos llegan en
      // ráfaga justo cuando se agota la cuota.
      if (patchRes.status !== 404) {
        console.error('[Guardar] PATCH falló:', patchRes.status, patchData);
        return responder(
          { error: "SheetDB rechazó la actualización", status: patchRes.status },
          502
        );
      }
    }

    console.log('[Guardar] No hay fila para el DNI, creando');

    // NO incluir `id`: lo genera una ARRAYFORMULA y escribirlo la rompe para
    // toda la hoja. Ver utils/sheetdb.js.
    const postRes = await fetch(`${API_URL}?sheet=${SHEET_PROGRESO}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: { dni: forzarTexto(dniLimpio), nombre, carrera, universidad, celular, area, fecha_inicio, paso1, paso2, paso3, paso4, paso5, paso6, paso7, paso8, paso9, ultima_actualizacion }
      })
    });

    const postData = await leerJson(postRes);

    if (!postRes.ok) {
      console.error('[Guardar] POST falló:', postRes.status, postData);
      return responder(
        { error: "SheetDB rechazó la creación", status: postRes.status },
        502
      );
    }

    console.log('[Guardar] Fila creada para DNI:', dniLimpio, postData);

    return responder({ success: true, accion: "creado", data: postData }, 200);

  } catch (error) {
    console.error('[Guardar] Error:', error);
    return responder({ error: error.message }, 500);
  }
}
