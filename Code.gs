/**
 * PUNTO DE ENTRADA DE LA WEB APP
 * Este archivo es indispensable para que el navegador muestre algo.
 */

function doGet(e) {
  // Intenta crear la plantilla desde 'Index.html'
  try {
    return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('WMS Control de Frío') // Título de la pestaña
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL) // Permite iframes
      .addMetaTag('viewport', 'width=device-width, initial-scale=1'); // Responsive móvil
  } catch (error) {
    // Si falla, muestra el error en pantalla en lugar de blanco
    return ContentService.createTextOutput("Error cargando la App: " + error.message);
  }
}

/**
 * Función para incluir archivos HTML parciales (CSS, JS, Vistas)
 * dentro del Index.html
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}