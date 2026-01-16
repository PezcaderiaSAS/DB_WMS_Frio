/**
 * CONTEXTO DE BASE DE DATOS
 * Maneja operaciones CRUD básicas, Bloqueos (Concurrency) con validaciones
 * y control robusto de acceso concurrente.
 */

const DB = {
  
  /**
   * Obtiene un candado con nombre específico para operaciones sobre hojas particulares
   * Permite mayor granularidad en control de concurrencia.
   * @param {string} sheetName - Nombre de la hoja
   * @returns {Lock} Candado nombrado
   */
  _getLockForSheet: function(sheetName) {
    return LockService.getDocumentLock(); // Usa Document Lock para todas las hojas
    // Alternativa si necesitas granularidad: return LockService.getNamedLock(`sheet_${sheetName}`);
  },
  
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
   * Con control de concurrencia mejorado.
   */
  appendRow: function(sheetName, rowData) {
    const validación = this._validarHoja(sheetName);
    if (!validación.válido) {
      throw new Error(validación.error);
    }
    
    if (!Array.isArray(rowData) || rowData.length === 0) {
      throw new Error('rowData debe ser un array no vacío');
    }
    
    const lock = this._getLockForSheet(sheetName);
    let lockAdquirido = false;
    
    try {
      // tryLock es preferible a waitLock para evitar deadlocks
      lockAdquirido = lock.tryLock(CONFIG.LOCK_TIMEOUT);
      if (!lockAdquirido) {
        throw new Error(`Timeout adquiriendo bloqueo para '${sheetName}'. Otro usuario está escribiendo.`);
      }
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        throw new Error(`Hoja '${sheetName}' no encontrada después de validación.`);
      }
      
      sheet.appendRow(rowData);
      SpreadsheetApp.flush();
      console.log(`✓ Fila agregada a '${sheetName}'`);
      
    } catch (e) {
      console.error(`❌ Error en appendRow('${sheetName}'):`, e.message);
      throw new Error(`Error guardando fila: ${e.message}`);
    } finally {
      if (lockAdquirido) {
        try {
          lock.releaseLock();
        } catch (e) {
          console.warn("⚠️ Error liberando candado:", e.message);
        }
      }
    }
  },

  /**
   * Busca y actualiza una celda específica.
   * Con control de concurrencia mejorado.
   */
  updateCell: function(sheetName, rowIndex, colIndex, value) {
    if (!rowIndex || !colIndex) {
      throw new Error('rowIndex y colIndex son requeridos');
    }
    
    const lock = this._getLockForSheet(sheetName);
    let lockAdquirido = false;
    
    try {
      lockAdquirido = lock.tryLock(CONFIG.LOCK_TIMEOUT);
      if (!lockAdquirido) {
        throw new Error(`Timeout adquiriendo bloqueo para '${sheetName}'.`);
      }
      
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) throw new Error(`Hoja '${sheetName}' no encontrada`);
      
      sheet.getRange(rowIndex, colIndex).setValue(value);
      SpreadsheetApp.flush();
      console.log(`✓ Celda actualizada: ${sheetName}[${rowIndex},${colIndex}]`);
      
    } catch (e) {
      console.error(`❌ Error en updateCell:`, e.message);
      throw new Error(`Error actualizando celda: ${e.message}`);
    } finally {
      if (lockAdquirido) {
        try {
          lock.releaseLock();
        } catch (e) {
          console.warn("⚠️ Error liberando candado:", e.message);
        }
      }
    }
  },

  /**
   * Escritura masiva optimizada con control de concurrencia.
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
    
    const lock = this._getLockForSheet(sheetName);
    let lockAdquirido = false;
    
    try {
      lockAdquirido = lock.tryLock(CONFIG.LOCK_TIMEOUT);
      if (!lockAdquirido) {
        throw new Error(`Timeout en appendBatch para '${sheetName}'.`);
      }
      
      const sheet = getSpreadsheet().getSheetByName(sheetName);
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow + 1, 1, rowsArray.length, rowsArray[0].length)
           .setValues(rowsArray);
      SpreadsheetApp.flush();
      console.log(`✓ ${rowsArray.length} filas agregadas en batch a '${sheetName}'`);
      
    } catch (e) {
      console.error(`❌ Error en appendBatch:`, e.message);
      throw new Error(`Error en appendBatch: ${e.message}`);
    } finally {
      if (lockAdquirido) {
        try {
          lock.releaseLock();
        } catch (e) {
          console.warn("⚠️ Error liberando candado:", e.message);
        }
      }
    }
  },

  /**
   * Sobrescribe toda la data de una hoja (Para actualización atómica)
   * Con control de concurrencia mejorado.
   */
  updateAllData: function(sheetName, values, startRow = 2) {
    if (!values || values.length === 0) {
      throw new Error('values no puede estar vacío');
    }
    
    const lock = this._getLockForSheet(sheetName);
    let lockAdquirido = false;
    
    try {
      lockAdquirido = lock.tryLock(CONFIG.LOCK_TIMEOUT);
      if (!lockAdquirido) {
        throw new Error(`Timeout en updateAllData para '${sheetName}'.`);
      }
      
      const sheet = getSpreadsheet().getSheetByName(sheetName);
      if (!sheet) throw new Error(`Hoja '${sheetName}' no encontrada`);
      
      sheet.getRange(startRow, 1, values.length, values[0].length).setValues(values);
      SpreadsheetApp.flush();
      console.log(`✓ updateAllData('${sheetName}'): ${values.length} filas actualizadas`);
      
    } catch (e) {
      console.error(`❌ Error en updateAllData:`, e.message);
      throw new Error(`Error en updateAllData: ${e.message}`);
    } finally {
      if (lockAdquirido) {
        try {
          lock.releaseLock();
        } catch (e) {
          console.warn("⚠️ Error liberando candado:", e.message);
        }
      }
    }
  },
  
  /**
   * Busca un registro por ID dinámicamente
   * @param {string} sheetName - Nombre de la hoja
   * @param {any} id - Valor del ID a buscar
   * @param {string} idFieldName - Nombre del campo ID (default: 'id_producto')
   * @returns {Object|null} Registro encontrado o null
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
  }
};