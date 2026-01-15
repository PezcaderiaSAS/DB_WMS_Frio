/**
 * MAPEO DE INTEGRACIÓN - CÓMO FUNCIONAN TODOS LOS ARCHIVOS JUNTOS
 * 
 * FLUJO DE DATOS:
 * Usuario (Index.html) → JavaScript.html → Controller_Movimientos.gs → DB_Context.gs → Google Sheets
 *                                        ↓
 *                      Service_Facturacion.gs (Batch nocturno)
 *                      Service_PDF.gs (Generación de PDFs)
 */

// ============================================================================
// 1. ENTRADA: Code.gs + Index.html + JavaScript.html
// ============================================================================
// - Code.gs: Carga Index.html como plantilla
// - Index.html: Template con Vue.js y estructura HTML
// - JavaScript.html: Contiene lógica de Vue + comunicación con backend
// - Flujo: Usuario interactúa → Vue emite eventos → google.script.run

// ============================================================================
// 2. CONTROL: Controller_Movimientos.gs
// ============================================================================
// Funciones expuestas para google.script.run:

/**
 * FUNCIÓN PÚBLICA: Procesa movimientos de entrada/salida
 * @param {Object} payload - { cabecera: {...}, items: [...] }
 * @returns {Object} { success: true, id, url } o { success: false, error }
 */
// procesarMovimientoBatch(payload)
//   ├─ Obtiene snapshot del inventario (PRODUCTOS)
//   ├─ Valida atomicidad (todo o nada)
//   ├─ Actualiza stocks en memoria
//   ├─ Genera ID único (MOV-XXXX)
//   ├─ Genera PDF con PDFService
//   ├─ Guarda en MOVIMIENTOS (batch)
//   └─ Retorna success/error con URL

/**
 * FUNCIÓN PÚBLICA: Carga datos iniciales para formulario
 * @returns { clientes: [], productos: [] }
 */
// getDatosIniciales()
//   ├─ Lee CLIENTES desde DB.getData()
//   └─ Lee PRODUCTOS desde DB.getData()

/**
 * FUNCIÓN PÚBLICA: Registra múltiples productos
 * @param {Array} listaProductos - [{id_cliente, nombre, empaque}...]
 * @returns { success: true, count } o error
 */
// registrarLoteProductos(listaProductos)
//   ├─ Genera IDs consecutivos (PRO-XXXX)
//   ├─ Valida que no están vacíos
//   └─ Guarda batch en PRODUCTOS

/**
 * FUNCIÓN PÚBLICA: Registra un cliente
 * @param {Object} cliente - {nombre, email, ...}
 * @returns { success: true, id, nuevoCliente }
 */
// registrarCliente(cliente)
//   ├─ Genera ID único (CLI-XXXX)
//   └─ Agrega fila en CLIENTES

// ============================================================================
// 3. BASE DE DATOS: DB_Context.gs
// ============================================================================
// Operaciones CRUD con validación y manejo de concurrencia:

// DB.getData(sheetName)
//   ├─ Valida que la hoja existe (NEW)
//   ├─ Lee datos y mapea a JSON
//   ├─ Agrega _rowIndex para updates
//   └─ Log: "✓ getData('PRODUCTOS'): 45 filas"

// DB.appendRow(sheetName, rowData)
//   ├─ Obtiene lock exclusivo (30s timeout)
//   ├─ Añade fila al final
//   ├─ Ejecuta flush inmediato
//   └─ Log: "✓ Fila agregada a 'PRODUCTOS'"

// DB.appendBatch(sheetName, rowsArray)
//   ├─ Validación: array 2D no vacío
//   ├─ Obtiene lock
//   ├─ Escribe todas las filas de una vez
//   └─ Log: "✓ 5 filas agregadas en batch"

// DB.updateCell(sheetName, rowIndex, colIndex, value)
//   ├─ Valida rowIndex y colIndex
//   ├─ Obtiene lock
//   └─ Actualiza celda específica

// DB.updateAllData(sheetName, values, startRow)
//   └─ Sobrescribe rango completo (atomicidad)

// DB.findById(sheetName, id, idFieldName)
//   ├─ NEW: Parámetro idFieldName personalizable
//   ├─ Busca en array cargado
//   └─ Retorna objeto o null con log

// DB._validarHoja(sheetName) [PRIVADO]
//   ├─ Verifica existencia de hoja
//   ├─ Valida que no esté vacía
//   └─ Valida headers

// ============================================================================
// 4. UTILIDADES: Utils.gs
// ============================================================================

// Utils.generarIdConsecutivo(sheetName, prefix)
//   ├─ Lee última fila de columna A
//   ├─ Extrae número con regex segura (NEW)
//   ├─ Incrementa y formatea con padding
//   └─ Retorna "PRO-0045" → "PRO-0046"

// Utils.obtenerUltimoNumeroId(sheetName)
//   ├─ Similar a anterior pero solo número
//   └─ USA regex segura (NEW)

// Utils.formatoMoneda(valor)
//   └─ Formatea a COP: 125000 → "$125.000"

// Utils.getFechaISO()
//   └─ Retorna "2024-01-15 14:30:45" (BD)

// Utils.getFechaLegible()
//   └─ Retorna "15/01/2024 2:30 PM" (Reportes)

// ============================================================================
// 5. CONFIGURACIÓN: Config.gs
// ============================================================================

// CONFIG (objeto global con getters dinámicos)
// ├─ SPREADSHEET_ID → Lee de Script Properties (NEW)
// ├─ FOLDER_RECIBOS_ID → Lee de Script Properties (NEW)
// ├─ SHEET_* → Nombres de hojas
// ├─ PREFIJO_* → Prefijos de IDs
// ├─ TIMEZONE → Zona horaria
// └─ LOCK_TIMEOUT → 30s

// getSpreadsheet()
//   ├─ Intenta abrir por CONFIG.SPREADSHEET_ID
//   ├─ Si falla, usa SpreadsheetApp.getActiveSpreadsheet()
//   └─ Try-catch con logging (NEW)

// inicializarConfiguracion(spreadsheetId, folderRecibosId)
//   └─ EJECUTAR UNA SOLA VEZ al configurar

// verificarConfiguracion()
//   └─ Retorna estado de Script Properties

// ============================================================================
// 6. SERVICIOS: Service_Facturacion.gs
// ============================================================================

// ejecutarCierreDiario() [Se ejecuta vía Trigger a las 11:59 PM]
//   ├─ Lee PRODUCTOS y CLIENTES
//   ├─ Agrupa kilos por cliente_dueño (FIXED)
//   ├─ Calcula costos variables por exceso
//   ├─ Guarda en HISTORIAL_SALDOS_DIARIOS
//   └─ Log: "✓ Cierre diario procesado"

// instalarTriggerFacturacion()
//   └─ Crea trigger automático (ejecutar UNA SOLA VEZ)

// ============================================================================
// 7. GENERACIÓN DE PDFs: Service_PDF.gs
// ============================================================================

// PDFService.generarReciboAgrupado(data)
// ├─ Carga template HTML (Plantilla_Recibo_Batch.html)
// ├─ Renderiza con datos del movimiento
// ├─ Convierte a PDF
// ├─ Guarda en FOLDER_RECIBOS_ID
// └─ Retorna URL pública

// ============================================================================
// 8. TESTING: Tests.gs (NUEVO)
// ============================================================================

// verificarConfig() → Muestra estado de Script Properties
// verificarHojas() → Valida existencia de hojas requeridas
// verificarHeaders() → Valida estructura de cada hoja
// pruebaLectura() → Intenta leer datos de cada hoja
// pruebaGeneracionIds() → Testa generación de IDs
// pruebaUtils() → Testa funciones de utilidad
// reporteSalud() → Ejecuta todas las pruebas

// ============================================================================
// GUÍA DE CONFIGURACIÓN INICIAL
// ============================================================================
/*
PASO 1: En Google Sheets
─────────────────────────
1. Crea hojas con estos nombres exactos:
   - CLIENTES
   - PRODUCTOS
   - MOVIMIENTOS
   - HISTORIAL_SALDOS_DIARIOS
   - DETALLE_MOVIMIENTOS (opcional)

2. Crea headers (fila 1) en cada hoja:
   
   CLIENTES:
   id_cliente | nombre_razon_social | email | limite_posicion_kg | costo_fijo_mes | costo_exceso_dia
   
   PRODUCTOS:
   id_producto | id_cliente | nombre_producto | tipo_empaque | stock_unidades | stock_kilos
   
   MOVIMIENTOS:
   id_movimiento | fecha | tipo | id_cliente | id_producto | unidades | kilos | saldo_final_u | saldo_final_k | url_pdf | usuario

3. Crea una carpeta en Drive para PDFs: RECIBOS_WMS

PASO 2: En Google Apps Script
──────────────────────────────
1. Copia todos los archivos .gs al proyecto

2. En la consola (Ctrl+Enter), ejecuta:
   inicializarConfiguracion("SPREADSHEET_ID_AQUI", "FOLDER_ID_AQUI")
   
   Obtén los IDs de:
   - Spreadsheet: URL entre /d/ y /edit
   - Folder: URL entre /folders/ y ?...

3. Ejecuta en consola:
   reporteSalud()
   
   Si todo es verde, ¡estás listo!

PASO 3: Configurar Trigger (Facturación nocturna)
──────────────────────────────────────────────────
1. En consola, ejecuta UNA SOLA VEZ:
   instalarTriggerFacturacion()

2. Verifica en Activadores: debe mostrar "ejecutarCierreDiario" a las 23:30

PASO 4: Hacer público (Web App)
──────────────────────────────
1. Deploy → Nuevo despliegue → Aplicación web
2. Ejecutar como: [Tu cuenta]
3. Quién tiene acceso: [Cualquiera]
4. ¡Copia la URL!
*/

// ============================================================================
// RESUMEN DE CAMBIOS REALIZADOS
// ============================================================================
/*
✓ Config.gs
  - IDs movidos a Script Properties (seguridad)
  - getSpreadsheet() con try-catch mejorado
  - funciones inicializarConfiguracion() y verificarConfiguracion()

✓ DB_Context.gs
  - _validarHoja() método privado para validación
  - Logging completo en todas las operaciones
  - Manejo mejorado de errores
  - findById() ahora recibe idFieldName personalizable

✓ Controller_Movimientos.gs
  - Headers mapeados dinámicamente (no hardcodeados)
  - Validación de headers al inicio
  - colStockU y colStockK guardados en mapa de inventario

✓ Service_Facturacion.gs
  - FIXED: Ahora filtra kilos por id_cliente
  - Validación: solo suma si kilos > 0

✓ Utils.gs
  - obtenerUltimoNumeroId() usa regex segura

✓ Tests.gs [NUEVO]
  - 8 funciones de verificación
  - reporteSalud() integral

✓ Documentación [ESTE ARCHIVO]
  - Mapeo completo de integración
  - Guía de configuración
  - Flujos de datos
*/
