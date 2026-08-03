// utils/sheetdb.js
//
// Utilidades compartidas por las API Routes de onboarding para hablar con SheetDB.
//
// ⚠️ CADA LLAMADA HTTP A SHEETDB DESCUENTA DE LA CUOTA MENSUAL (500 en el plan
// gratuito), INCLUIDAS LAS QUE FALLAN CON 4xx O 5xx. Lo que se hace con los datos
// después de recibirlos —filtrar, buscar, ordenar— es gratis. Antes de añadir un
// `fetch` a SheetDB, contá cuántas peticiones cuesta el flujo completo.
//
// ⚠️ LA HOJA `onboarding_progreso` TIENE UNA COLUMNA `id` GENERADA POR UNA
// ARRAYFORMULA (`=ARRAYFORMULA(SI(B2:B<>""; FILA(B2:B); ""))`, celda R2).
// NUNCA incluyas `id` en el cuerpo de un POST o un PATCH: escribir un valor
// estático dentro del rango de expansión rompe la fórmula con #REF! y borra los
// id de TODAS las filas a la vez.

// SheetDB devuelve JSON en sus respuestas normales, pero cuando la ruta no le
// encaja responde con una página HTML de error. Un `res.json()` a secas lanza
// SyntaxError ante ese HTML y la route acaba devolviendo un 500 con un mensaje
// sobre "Unexpected token '<'" que no apunta al problema real.
export async function leerJson(res) {
  const texto = await res.text();

  try {
    return texto ? JSON.parse(texto) : null;
  } catch {
    console.error(
      "[SheetDB] Respuesta no-JSON:",
      res.status,
      texto.slice(0, 120),
    );
    return null;
  }
}

// El DNI llega tecleado desde Wix y se compara contra celdas que a veces rellena
// una persona a mano. Se recorta a los dos lados para que un espacio invisible no
// produzca un "DNI no encontrado" fantasma.
export function normalizarDni(valor) {
  return String(valor ?? "").trim();
}

// Busca sobre filas YA DESCARGADAS, así que no cuesta ninguna petición extra.
// Prueba primero la coincidencia exacta y solo después la que ignora ceros
// iniciales, para no alterar el comportamiento de un DNI corriente.
export function buscarPorDni(filas, columna, dni) {
  if (!Array.isArray(filas)) return undefined;

  // Un DNI vacío coincidiría con la fila que solo lleva el aviso
  // "NO ELIMINAR ESTA CELDA" y la devolvería como si fuera una persona.
  if (!dni) return undefined;

  const exacta = filas.find((fila) => normalizarDni(fila[columna]) === dni);
  if (exacta) return exacta;

  const sinCeros = dni.replace(/^0+/, "");
  if (!sinCeros) return undefined;

  const aproximada = filas.find(
    (fila) => normalizarDni(fila[columna]).replace(/^0+/, "") === sinCeros,
  );

  if (aproximada) {
    console.warn(
      `[SheetDB] DNI "${dni}" encontrado como "${aproximada[columna]}". La celda perdió el cero inicial por estar en formato numérico; conviene pasar esa columna a texto.`,
    );
  }

  return aproximada;
}

// Formas equivalentes de un DNI, la original siempre primero. Para un DNI sin
// cero inicial la lista tiene un solo elemento, así que el caso normal no paga
// ninguna petición extra.
export function variantesDni(dni) {
  const variantes = [dni];

  const sinCeros = dni.replace(/^0+/, "");
  if (sinCeros && sinCeros !== dni) variantes.push(sinCeros);

  return variantes;
}

// Un apóstrofo inicial obliga a Google Sheets a guardar el valor como texto en
// vez de interpretarlo como número, que es lo que hace que un "07531333" acabe
// almacenado como 7531333. No forma parte del dato: Sheets no lo muestra y
// SheetDB lo devuelve ya sin él (verificado contra el entorno DEV).
export function forzarTexto(valor) {
  const limpio = normalizarDni(valor);

  return limpio ? `'${limpio}` : "";
}

export function ahoraEnLima() {
  return new Date().toLocaleString("es-PE", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
