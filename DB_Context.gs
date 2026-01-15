/**
 * CONTEXTO DE BASE DE DATOS
 * Maneja operaciones CRUD básicas y Bloqueos (Concurrency) con validaciones
 */

const DB = {
  
  /**
   * Valida que una hoja existe y tiene estructura correcta
   * @param {string} sheetName - Nombre de la pestaña
   * @returns {Object} {válido: boolean, error: string|null}
   */
  _validarHoja: function(sheetName) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        return { válido: false, error: `Hoja '${sheetName}' no encontrada` };
      }
      const data = sheet.getDataRange().getValues();
      if (data.length === 0) {
        return { válido: false, error: `Hoja '${sheetName}' vacía` };
      }
      if (data[0].length === 0) {
        return { válido: false, error: `Hoja '${sheetName}' sin encabezados` };
      }
      return { válido: true };
    } catch (e) {
      return { válido: false, error: e.message };
    }
  },
  
  /**
   * Obtiene todos los datos de una hoja convertidos a Array de Objetos (JSON)
   * Asume que la fila 1 tiene los encabezados.
   */
  getData: function(sheetName) {
    // Validar estructura
    const validación = this._validarHoja(sheetName);
    if (!validación.válido) {
      console.error('❌ Error en getData:', validación.error);
      return [];
    }
    
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(sheetName);
      const data = sheet.getDataRange().getValues();
      
      if (data.length <= 1) return [];
      
      const headers = data[0];
      const rows = [];
      
      for (let i = 1; i < data.length; i++) {
        let rowObj = {};
        let currentRow = data[i];
        // Mapear encabezado: valor
        headers.forEach((header, index) => {
          rowObj[header] = currentRow[index];
        });
        // Añadir metadato de número de fila
        rowObj['_rowIndex'] = i + 1; 
        rows.push(rowObj);
      }
      console.log(`✓ getData('${sheetName}'): ${rows.length} filas cargadas`);
      return rows;
    } catch (e) {
      console.error(`❌ Error en getData('${sheetName}'):`, e.message);
      return [];
    }
  },

  /**
   * Agrega una fila nueva al final de la hoja.
   */
  appendRow: function(sheetName, rowData) {
    const validación = this._validarHoja(sheetName);
    if (!validación.válido) {
      throw new Error(validación.error);
    }
    
    if (!Array.isArray(rowData) || rowData.length === 0) {
      throw new Error('rowData debe ser un array no vacío');
    }
    
    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(CONFIG.LOCK_TIMEOUT); 
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(sheetName);
      sheet.appendRow(rowData);
      SpreadsheetApp.flush();
      console.log(`✓ Fila agregada a '${sheetName}'`);
    } catch (e) {
      throw new Error(`Error de concurrencia en DB (Timeout): ${e.message}`);
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Busca y actualiza una celda específica.
   */
  updateCell: function(sheetName, rowIndex, colIndex, value) {
    if (!rowIndex || !colIndex) {
      throw new Error('rowIndex y colIndex son requeridos');
    }
    
    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(CONFIG.LOCK_TIMEOUT);
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) throw new Error(`Hoja '${sheetName}' no encontrada`);
      
      sheet.getRange(rowIndex, colIndex).setValue(value);
      SpreadsheetApp.flush();
      console.log(`✓ Celda actualizada: ${sheetName}[${rowIndex},${colIndex}]`);
    } catch (e) {
      throw new Error(`Error actualizando celda: ${e.message}`);
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Escritura masiva optimizada
   */
  appendBatch: function(sheetName, rowsArray) {
    const validación = this._validarHoja(sheetName);
    if (!validación.válido) {
      throw new Error(validación.error);
    }
    
    if (rowsArray.length === 0) {
      console.warn('⚠️ appendBatch: Array vacío');
      return;
    }
    
    if (!Array.isArray(rowsArray[0])) {
      throw new Error('rowsArray debe ser un array de arrays');
    }
    
    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(CONFIG.LOCK_TIMEOUT);
      const sheet = getSpreadsheet().getSheetByName(sheetName);
      sheet.getRange(sheet.getLastRow() + 1, 1, rowsArray.length, rowsArray[0].length)
           .setValues(rowsArray);
      SpreadsheetApp.flush();
      console.log(`✓ ${rowsArray.length} filas agregadas en batch a '${sheetName}'`);
    } catch (e) {
      throw new Error(`Error en appendBatch: ${e.message}`);
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Sobrescribe toda la data de una hoja (Para actualización atómica)
   */
  updateAllData: function(sheetName, values, startRow = 2) {
    if (!values || values.length === 0) {
      throw new Error('values no puede estar vacío');
    }
    
    try {
      const sheet = getSpreadsheet().getSheetByName(sheetName);
      if (!sheet) throw new Error(`Hoja '${sheetName}' no encontrada`);
      
      sheet.getRange(startRow, 1, values.length, values[0].length).setValues(values);
      console.log(`✓ updateAllData('${sheetName}'): ${values.length} filas actualizadas`);
    } catch (e) {
      throw new Error(`Error en updateAllData: ${e.message}`);
    }
  },
  
  /**
   * Busca un registro por ID dinámicamente
   */
  findById: function(sheetName, id, idFieldName = 'id_producto') {
    try {
      const data = this.getData(sheetName);
      const resultado = data.find(row => row[idFieldName] == id);
      if (!resultado) {
        console.warn(`⚠️ No encontrado: ${idFieldName}=${id} en '${sheetName}'`);
      }
      return resultado || null;
    } catch (e) {
      console.error(`❌ Error en findById:`, e.message);
      return null;
    }
  }
};