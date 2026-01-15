/**
 * UTILS
 * Funciones auxiliares para IDs, fechas y formatos.
 */

const Utils = {

  /**
   * Genera un ID autoincremental basado en el prefijo y la última fila de la hoja.
   * Ej: Si el último es MOV-0010, retorna MOV-0011.
   * @param {string} sheetName - Nombre de la hoja a consultar.
   * @param {string} prefix - Prefijo del ID (ej: "MOV-").
   */
  generarIdConsecutivo: function(sheetName, prefix) {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    const lastRow = sheet.getLastRow();
    
    // Si la hoja está vacía (solo encabezados), iniciar en 1
    if (lastRow <= 1) {
      return prefix + "0001";
    }
    
    // Asumimos que la Columna A (índice 1) siempre tiene el ID
    const lastId = sheet.getRange(lastRow, 1).getValue();
    
    // Si por error manual la celda está vacía, forzar timestamp para evitar error
    if (!lastId || typeof lastId !== 'string') {
      return prefix + new Date().getTime(); 
    }

    // Extraer la parte numérica del ID (eliminar prefijo)
    const numeroStr = lastId.replace(prefix, "");
    const numero = parseInt(numeroStr, 10);
    
    if (isNaN(numero)) {
       // Fallback si el formato no es estándar
       return prefix + new Date().getTime();
    }

    // Incrementar y formatear con ceros a la izquierda (PadStart 4 dígitos)
    const nuevoNumero = numero + 1;
    return prefix + nuevoNumero.toString().padStart(4, '0');
  },

  /**
   * Formatea un número como moneda (COP).
   */
  formatoMoneda: function(valor) {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP',
      maximumFractionDigits: 0 
    }).format(valor);
  },

  /**
   * Retorna fecha actual en formato ISO para la BD
   */
  getFechaISO: function() {
    return Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd HH:mm:ss");
  },
  
  /**
   * Retorna fecha legible para reportes
   */
  getFechaLegible: function() {
    return Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "dd/MM/yyyy HH:mm a");
  },

  // Nuevo helper para Batch
  obtenerUltimoNumeroId: function(sheetName) {
    const sheet = getSpreadsheet().getSheetByName(sheetName);
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return 0;
    const val = sheet.getRange(lastRow, 1).getValue(); // Asume ID en Col A
    // Extraer número de "PRO-0045" usando regex segura
    const match = String(val).match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

};