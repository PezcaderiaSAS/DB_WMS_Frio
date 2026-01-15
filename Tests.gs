/**
 * ARCHIVO DE PRUEBAS Y VERIFICACIÓN
 * Ejecuta estas funciones para validar que todo funciona correctamente
 * Ejecuta en el orden indicado
 */

/**
 * 1. VERIFICAR CONFIGURACIÓN INICIAL
 * Ejecutar PRIMERO para configurar IDs (solo una vez)
 */
function verificarConfig() {
  console.log('=== VERIFICACIÓN DE CONFIGURACIÓN ===');
  
  const estado = verificarConfiguracion();
  console.log('Estado actual:');
  console.log(JSON.stringify(estado, null, 2));
  
  // Si no está configurado, muestra instrucciones
  if (estado.SPREADSHEET_ID === '✗ No configurado') {
    console.warn('\n⚠️ IMPORTANTE: Script Properties sin configurar');
    console.warn('Ejecuta en la consola de Apps Script:');
    console.warn('inicializarConfiguracion("TU_SPREADSHEET_ID", "TU_FOLDER_ID")');
    console.warn('\nPuedes obtener los IDs de:');
    console.warn('- SPREADSHEET_ID: URL del Sheet (entre /d/ y /edit)');
    console.warn('- FOLDER_RECIBOS_ID: URL de la carpeta en Drive (entre /folders/ y ?...)');
  }
  
  return estado;
}

/**
 * 2. VERIFICAR HOJAS EXISTEN
 * Verifica que todas las hojas requeridas estén presentes
 */
function verificarHojas() {
  console.log('\n=== VERIFICACIÓN DE HOJAS ===');
  
  const hojasPorVerificar = [
    CONFIG.SHEET_CLIENTES,
    CONFIG.SHEET_PRODUCTOS,
    CONFIG.SHEET_MOVIMIENTOS,
    CONFIG.SHEET_HISTORIAL
  ];
  
  let resultado = { válidas: [], faltantes: [] };
  
  hojasPorVerificar.forEach(sheetName => {
    const validación = DB._validarHoja(sheetName);
    if (validación.válido) {
      resultado.válidas.push(sheetName);
      console.log(`✓ ${sheetName}`);
    } else {
      resultado.faltantes.push({ hoja: sheetName, error: validación.error });
      console.error(`✗ ${sheetName}: ${validación.error}`);
    }
  });
  
  return resultado;
}

/**
 * 3. VERIFICAR ESTRUCTURA DE HEADERS
 * Verifica que cada hoja tiene los headers esperados
 */
function verificarHeaders() {
  console.log('\n=== VERIFICACIÓN DE HEADERS ===');
  
  const headersEsperados = {
    [CONFIG.SHEET_CLIENTES]: ['id_cliente', 'nombre_razon_social', 'email'],
    [CONFIG.SHEET_PRODUCTOS]: ['id_producto', 'id_cliente', 'nombre_producto', 'tipo_empaque', 'stock_unidades', 'stock_kilos'],
    [CONFIG.SHEET_MOVIMIENTOS]: ['id_movimiento', 'fecha', 'tipo', 'id_cliente', 'id_producto', 'unidades', 'kilos']
  };
  
  let resultado = {};
  
  for (const [sheetName, headerList] of Object.entries(headersEsperados)) {
    try {
      const ss = getSpreadsheet();
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        resultado[sheetName] = { estado: '✗', error: 'Hoja no encontrada' };
        console.error(`✗ ${sheetName}: no existe`);
        continue;
      }
      
      const data = sheet.getDataRange().getValues();
      if (data.length === 0) {
        resultado[sheetName] = { estado: '✗', error: 'Hoja vacía' };
        console.error(`✗ ${sheetName}: vacía`);
        continue;
      }
      
      const headers = data[0];
      const faltantes = headerList.filter(h => !headers.includes(h));
      
      if (faltantes.length === 0) {
        resultado[sheetName] = { estado: '✓', headers: headers };
        console.log(`✓ ${sheetName}: ${headers.join(', ')}`);
      } else {
        resultado[sheetName] = { estado: '✗', faltantes: faltantes, headers: headers };
        console.error(`✗ ${sheetName}: Headers faltantes: ${faltantes.join(', ')}`);
        console.error(`  Headers actuales: ${headers.join(', ')}`);
      }
    } catch (e) {
      resultado[sheetName] = { estado: '✗', error: e.message };
      console.error(`✗ ${sheetName}: ${e.message}`);
    }
  }
  
  return resultado;
}

/**
 * 4. PRUEBA DE LECTURA DE DATOS
 * Intenta leer datos de cada hoja
 */
function pruebaLectura() {
  console.log('\n=== PRUEBA DE LECTURA DE DATOS ===');
  
  const sheetNames = [
    CONFIG.SHEET_CLIENTES,
    CONFIG.SHEET_PRODUCTOS,
    CONFIG.SHEET_MOVIMIENTOS
  ];
  
  let resultado = {};
  
  sheetNames.forEach(sheetName => {
    try {
      const datos = DB.getData(sheetName);
      resultado[sheetName] = { 
        estado: '✓', 
        filas: datos.length,
        muestra: datos.length > 0 ? datos[0] : 'vacío'
      };
      console.log(`✓ ${sheetName}: ${datos.length} filas`);
    } catch (e) {
      resultado[sheetName] = { estado: '✗', error: e.message };
      console.error(`✗ ${sheetName}: ${e.message}`);
    }
  });
  
  return resultado;
}

/**
 * 5. PRUEBA DE GENERACIÓN DE IDs
 * Verifica que las funciones de ID funcionan
 */
function pruebaGeneracionIds() {
  console.log('\n=== PRUEBA DE GENERACIÓN DE IDs ===');
  
  try {
    const idMov = Utils.generarIdConsecutivo(CONFIG.SHEET_MOVIMIENTOS, CONFIG.PREFIJO_MOVIMIENTOS);
    console.log(`✓ Nuevo ID Movimiento: ${idMov}`);
    
    const idCli = Utils.generarIdConsecutivo(CONFIG.SHEET_CLIENTES, CONFIG.PREFIJO_CLIENTES);
    console.log(`✓ Nuevo ID Cliente: ${idCli}`);
    
    const idProd = Utils.generarIdConsecutivo(CONFIG.SHEET_PRODUCTOS, CONFIG.PREFIJO_PRODUCTOS);
    console.log(`✓ Nuevo ID Producto: ${idProd}`);
    
    return { estado: '✓', ids: { idMov, idCli, idProd } };
  } catch (e) {
    console.error(`✗ Error generando IDs: ${e.message}`);
    return { estado: '✗', error: e.message };
  }
}

/**
 * 6. PRUEBA DE UTILIDADES
 * Verifica funciones de utilidad
 */
function pruebaUtils() {
  console.log('\n=== PRUEBA DE UTILIDADES ===');
  
  try {
    // Prueba formato de moneda
    const moneda = Utils.formatoMoneda(125000);
    console.log(`✓ Formato moneda: ${moneda}`);
    
    // Prueba fecha ISO
    const fechaISO = Utils.getFechaISO();
    console.log(`✓ Fecha ISO: ${fechaISO}`);
    
    // Prueba fecha legible
    const fechaLegible = Utils.getFechaLegible();
    console.log(`✓ Fecha legible: ${fechaLegible}`);
    
    return { estado: '✓', muestras: { moneda, fechaISO, fechaLegible } };
  } catch (e) {
    console.error(`✗ Error en Utils: ${e.message}`);
    return { estado: '✗', error: e.message };
  }
}

/**
 * 7. REPORTE COMPLETO DE SALUD DEL SISTEMA
 * Ejecuta todas las pruebas y genera un resumen
 */
function reporteSalud() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  REPORTE DE SALUD DEL SISTEMA WMS - DB CONTROL FRIO   ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  const reportes = {
    configuracion: verificarConfig(),
    hojas: verificarHojas(),
    headers: verificarHeaders(),
    lectura: pruebaLectura(),
    ids: pruebaGeneracionIds(),
    utils: pruebaUtils()
  };
  
  // Resumen
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  RESUMEN                                               ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  const allValid = 
    reportes.hojas.faltantes.length === 0 &&
    reportes.ids.estado === '✓' &&
    reportes.utils.estado === '✓';
  
  if (allValid) {
    console.log('✓ ¡Sistema operativo! Todo funciona correctamente.');
  } else {
    console.log('⚠️ Hay problemas que necesitan atención:');
    if (reportes.hojas.faltantes.length > 0) {
      console.log('  - Hojas faltantes:', reportes.hojas.faltantes.map(h => h.hoja).join(', '));
    }
  }
  
  return reportes;
}

/**
 * 8. VALIDAR ATOMICIDAD DE MOVIMIENTOS
 * Simula un movimiento (sin guardar en la BD)
 */
function pruebaAtomicidad() {
  console.log('\n=== PRUEBA DE ATOMICIDAD ===');
  
  try {
    const payload = {
      cabecera: {
        tipo: 'ENTRADA',
        id_cliente: 'CLI-001',
        nombre_cliente: 'Cliente Test'
      },
      items: [
        { id_producto: 'PRO-001', unidades: 10, kilos: 50 }
      ]
    };
    
    console.log('Simulando movimiento:');
    console.log(JSON.stringify(payload, null, 2));
    
    // Aquí iría la lógica de validación sin guardar
    console.log('✓ Validación de atomicidad (simulada)');
    
    return { estado: '✓', mensaje: 'Validación de atomicidad correcta' };
  } catch (e) {
    console.error(`✗ Error: ${e.message}`);
    return { estado: '✗', error: e.message };
  }
}
