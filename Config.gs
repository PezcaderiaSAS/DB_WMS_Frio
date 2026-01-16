/**
 * CONFIGURACIÓN GLOBAL DEL PROYECTO WMS
 * Centraliza IDs y Nombres de Hojas para facilitar cambios futuros.
 */

const CONFIG = {
  // Nombres de las Hojas (Tabs) - NO cambiar sin actualizar Sheets
  SHEET_CLIENTES: 'CLIENTES',
  SHEET_PRODUCTOS: 'PRODUCTOS',
  SHEET_MOVIMIENTOS: 'MOVIMIENTOS',
  SHEET_HISTORIAL: 'HISTORIAL_SALDOS_DIARIOS',
  SHEET_DETALLE_MOV: 'DETALLE_MOVIMIENTOS',
  
  // Configuración de Negocio
  PREFIJO_MOVIMIENTOS: 'MOV-',
  PREFIJO_CLIENTES: 'CLI-',
  PREFIJO_PRODUCTOS: 'PRO-',
  
  // Configuración Técnica
  TIMEZONE: 'America/Bogota',
  LOCK_TIMEOUT: 30000,
  
  SPREADSHEET_ID: '1_xlPpu_KgdY-ClHx9BDxA5dfUPP_I6ARRHBCbz_2caE', 
  FOLDER_RECIBOS_ID: '1AQZ_el8mIf5Bdz04T7zam_SlwtmVGDEw',

  // Getters dinámicos para IDs (desde Script Properties)
  get SPREADSHEET_ID() {
    return PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '';
  },
  get FOLDER_RECIBOS_ID() {
    return PropertiesService.getScriptProperties().getProperty('FOLDER_RECIBOS_ID') || '';
  }
};

/**
 * INICIALIZACIÓN - Ejecutar UNA SOLA VEZ para configurar IDs
 * Reemplaza con tus IDs reales y ejecuta desde el Editor de Apps Script
 */
function inicializarConfiguracion(spreadsheetId, folderRecibosId) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('SPREADSHEET_ID', spreadsheetId);
  props.setProperty('FOLDER_RECIBOS_ID', folderRecibosId);
  console.log('✓ Configuración guardada en Script Properties');
  return { 
    spreadsheetId: spreadsheetId, 
    folderRecibosId: folderRecibosId,
    mensaje: 'Propiedades actualizadas correctamente'
  };
}

/**
 * Función para verificar la configuración actual
 */
function verificarConfiguracion() {
  const props = PropertiesService.getScriptProperties();
  return {
    SPREADSHEET_ID: props.getProperty('SPREADSHEET_ID') ? '✓ Configurado' : '✗ No configurado',
    FOLDER_RECIBOS_ID: props.getProperty('FOLDER_RECIBOS_ID') ? '✓ Configurado' : '✗ No configurado',
    hojas: Object.keys(CONFIG).filter(k => k.startsWith('SHEET_'))
  };
}

/**
 * Función helper para obtener conexión rápida al libro activo o por ID
 * Usa Script Properties para mayor seguridad
 */
function getSpreadsheet() {
  const ssId = CONFIG.SPREADSHEET_ID;
  
  if (ssId) {
    try {
      return SpreadsheetApp.openById(ssId);
    } catch (e) {
      console.error('❌ Error abriendo Spreadsheet por ID:', e.message);
      console.error('Verifica que SPREADSHEET_ID sea válido y que tengas permisos');
      return SpreadsheetApp.getActiveSpreadsheet();
    }
  }
  
  return SpreadsheetApp.getActiveSpreadsheet();
}