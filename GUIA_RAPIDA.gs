/**
 * GUÍA RÁPIDA DE INICIO
 * Para poner el sistema en producción en 15 minutos
 */

// ════════════════════════════════════════════════════════════════════════════════
// PASO 1: CONFIGURAR SCRIPT PROPERTIES (2 MINUTOS)
// ════════════════════════════════════════════════════════════════════════════════

/**
 * ✓ En Google Sheets, copia la URL:
 *   https://docs.google.com/spreadsheets/d/[ESTO_ES_SPREADSHEET_ID]/edit
 * 
 * ✓ En Google Drive, abre la carpeta de PDFs y copia:
 *   https://drive.google.com/drive/folders/[ESTO_ES_FOLDER_ID]?...
 * 
 * ✓ En el Editor de Apps Script (Ctrl+Enter), ejecuta:
 *   inicializarConfiguracion("SPREADSHEET_ID_AQUI", "FOLDER_ID_AQUI")
 * 
 * ✓ Deberías ver:
 *   ✓ Configuración guardada en Script Properties
 */

// ════════════════════════════════════════════════════════════════════════════════
// PASO 2: VERIFICAR CONFIGURACIÓN (1 MINUTO)
// ════════════════════════════════════════════════════════════════════════════════

/**
 * ✓ En la consola, ejecuta:
 *   reporteSalud()
 * 
 * ✓ Deberías ver:
 *   - ✓ CLIENTES existe
 *   - ✓ PRODUCTOS existe
 *   - ✓ MOVIMIENTOS existe
 *   - ✓ HISTORIAL_SALDOS_DIARIOS existe
 * 
 * Si ves ✗, sigue a PASO 3
 */

// ════════════════════════════════════════════════════════════════════════════════
// PASO 3: CREAR HOJAS EN GOOGLE SHEETS (10 MINUTOS)
// ════════════════════════════════════════════════════════════════════════════════

/**
 * En tu Google Sheet, crea estas pestañas (hace clic derecho en pestaña):
 * 
 * PESTAÑA 1: CLIENTES
 * ┌─────────────────────────────────────────────────────────────┐
 * │ id_cliente │ nombre_razon_social │ email │ ... │            │
 * │ CLI-0001   │ Acme Corp           │ ... │            │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * PESTAÑA 2: PRODUCTOS
 * ┌──────────────────────────────────────────────────────────────────┐
 * │ id_producto │ id_cliente │ nombre_producto │ tipo_empaque │ ... │
 * │ PRO-0001    │ CLI-0001   │ Queso Fresco    │ Kg          │ ... │
 * └──────────────────────────────────────────────────────────────────┘
 * 
 * PESTAÑA 3: MOVIMIENTOS
 * ┌────────────────────────────────────────────────────────────────┐
 * │ id_movimiento │ fecha │ tipo │ id_cliente │ id_producto │ ... │
 * │ MOV-0001      │ hoy   │ ENT  │ CLI-0001   │ PRO-0001    │ ... │
 * └────────────────────────────────────────────────────────────────┘
 * 
 * PESTAÑA 4: HISTORIAL_SALDOS_DIARIOS
 * ┌────────────────────────────────────────────────────────────┐
 * │ fecha │ id_cliente │ nombre_cliente │ kilos_totales │ ... │
 * └────────────────────────────────────────────────────────────┘
 * 
 * ⚠️ IMPORTANTE: Los headers (fila 1) DEBEN tener exactamente
 *    estos nombres (mayúsculas, guiones, sin acentos)
 */

// ════════════════════════════════════════════════════════════════════════════════
// PASO 4: VALIDAR ESTRUCTURA (1 MINUTO)
// ════════════════════════════════════════════════════════════════════════════════

/**
 * ✓ En la consola, ejecuta nuevamente:
 *   reporteSalud()
 * 
 * Deberías ver TODO en verde ✓
 */

// ════════════════════════════════════════════════════════════════════════════════
// PASO 5: CONFIGURAR TRIGGER NOCTURNO (1 MINUTO)
// ════════════════════════════════════════════════════════════════════════════════

/**
 * ✓ En la consola, ejecuta UNA SOLA VEZ:
 *   instalarTriggerFacturacion()
 * 
 * ✓ Verifica en Activadores (engranaje → Activadores):
 *   - Función: ejecutarCierreDiario
 *   - Tipo de evento: Por tiempo
 *   - Frecuencia: Diaria
 *   - Hora: Alrededor de las 23:30
 */

// ════════════════════════════════════════════════════════════════════════════════
// PASO 6: DESPLEGAR COMO WEB APP (5 MINUTOS)
// ════════════════════════════════════════════════════════════════════════════════

/**
 * ✓ En el Editor de Apps Script:
 *   1. Engranaje (Configuración del proyecto)
 *   2. Pestaña "Despliegues"
 *   3. "Nuevo despliegue" → Tipo: "Aplicación web"
 *   4. Ejecutar como: [Tu cuenta]
 *   5. Quién tiene acceso: "Cualquiera"
 *   6. "Desplegar"
 * 
 * ✓ Copia la URL, ¡ese es tu sistema!
 */

// ════════════════════════════════════════════════════════════════════════════════
// PASO 7: PRUEBA RÁPIDA (3 MINUTOS)
// ════════════════════════════════════════════════════════════════════════════════

/**
 * En la web app que desplegaste:
 * 
 * 1. Haz clic en "Nuevo Cliente"
 * 2. Ingresa: Nombre = "Test Corp", Email = "test@corp.com"
 * 3. Guarda
 * 4. Abre tu Google Sheet y verifica que se agregó en CLIENTES ✓
 * 
 * 5. Haz clic en "Agregar Producto"
 * 6. Ingresa: Nombre = "Queso", Empaque = "Kg"
 * 7. Guarda
 * 8. Verifica en PRODUCTOS ✓
 * 
 * 9. Selecciona cliente y producto, ingresa cantidad
 * 10. Procesa ENTRADA
 * 11. Deberías ver un PDF generado ✓
 * 12. Stock en PRODUCTOS debe haber aumentado ✓
 */

// ════════════════════════════════════════════════════════════════════════════════
// COMANDOS ÚTILES (REFERENCIA)
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Diagnóstico completo:
 *   reporteSalud()
 * 
 * Configurar IDs:
 *   inicializarConfiguracion("SPREADSHEET_ID", "FOLDER_ID")
 * 
 * Ver estado actual:
 *   verificarConfiguracion()
 * 
 * Validar hojas:
 *   verificarHojas()
 * 
 * Validar headers:
 *   verificarHeaders()
 * 
 * Probar lectura:
 *   pruebaLectura()
 * 
 * Instalar trigger:
 *   instalarTriggerFacturacion()
 * 
 * Ver este archivo:
 *   mostrarResumenFinal()
 */

// ════════════════════════════════════════════════════════════════════════════════
// ESTRUCTURA DE ARCHIVOS FINAL
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Tu proyecto de Google Apps Script debe tener:
 * 
 * BACKEND (Google Apps Script):
 * ├─ Code.gs                      ← Punto de entrada
 * ├─ Config.gs                    ← Configuración + Script Properties
 * ├─ DB_Context.gs                ← Operaciones con Sheets
 * ├─ Controller_Movimientos.gs    ← Lógica de negocio
 * ├─ Service_Facturacion.gs       ← Batch nocturno
 * ├─ Service_PDF.gs               ← Generación de PDFs
 * ├─ Utils.gs                     ← Utilidades
 * ├─ Tests.gs                     ← Suite de verificación
 * ├─ INTEGRACION.gs               ← Documentación
 * └─ VERIFICACION_FINAL.gs        ← Resumen ejecutivo
 * 
 * FRONTEND (HTML):
 * ├─ Index.html                   ← Template principal
 * ├─ JavaScript.html              ← Lógica Vue.js
 * ├─ Formulario.html              ← Template de formulario
 * ├─ Estilos.html                 ← CSS
 * └─ Plantilla_Recibo_Batch.html  ← Template para PDF
 * 
 * GOOGLE SHEETS:
 * ├─ CLIENTES (hoja)
 * ├─ PRODUCTOS (hoja)
 * ├─ MOVIMIENTOS (hoja)
 * ├─ HISTORIAL_SALDOS_DIARIOS (hoja)
 * └─ DETALLE_MOVIMIENTOS (opcional)
 * 
 * GOOGLE DRIVE:
 * └─ Carpeta: RECIBOS_WMS (para PDFs)
 */

// ════════════════════════════════════════════════════════════════════════════════
// CHECKLIST FINAL
// ════════════════════════════════════════════════════════════════════════════════

const CHECKLIST = {
  configuracion: [
    "☐ Obtuviste SPREADSHEET_ID",
    "☐ Obtuviste FOLDER_RECIBOS_ID",
    "☐ Ejecutaste inicializarConfiguracion()"
  ],
  
  estructura: [
    "☐ Creaste hojas: CLIENTES, PRODUCTOS, MOVIMIENTOS, HISTORIAL_SALDOS_DIARIOS",
    "☐ Agregaste headers correctos (ver INTEGRACION.gs)",
    "☐ ejecutaste reporteSalud() y todo es ✓"
  ],
  
  triggers: [
    "☐ Ejecutaste instalarTriggerFacturacion()",
    "☐ Verificaste el trigger en Activadores"
  ],
  
  deploy: [
    "☐ Hiciste Deploy como Aplicación web",
    "☐ Copiaste la URL"
  ],
  
  testing: [
    "☐ Registraste un cliente de prueba",
    "☐ Registraste un producto de prueba",
    "☐ Procesaste una entrada/salida",
    "☐ Verificaste que se creó el PDF",
    "☐ Verificaste que cambió el stock"
  ]
};

/**
 * Para ver este checklist:
 *   console.table(CHECKLIST)
 */

// ════════════════════════════════════════════════════════════════════════════════
// INFORMACIÓN IMPORTANTE
// ════════════════════════════════════════════════════════════════════════════════

/**
 * ⚠️ NO HAGAS ESTO:
 * ❌ No cambies los nombres de las hojas sin actualizar Config.gs
 * ❌ No reordenes columnas sin revisar los mapeos
 * ❌ No ejecutes inicializarConfiguracion() dos veces
 * ❌ No ejecutes instalarTriggerFacturacion() dos veces
 * 
 * ✓ SÍ HACES ESTO:
 * ✓ Revisa los logs (Ctrl+Enter) después de cada operación
 * ✓ Usa reporteSalud() para diagnosticar
 * ✓ Guarda versiones de tu Google Sheet
 * ✓ Prueba primero con datos ficticios
 */

// ════════════════════════════════════════════════════════════════════════════════
// SOPORTE RÁPIDO
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Si algo no funciona:
 * 
 * 1. Ejecuta reporteSalud()
 * 2. Busca los ✗ en rojo
 * 3. Lee el error exacto
 * 4. Revisa VERIFICACION_FINAL.gs → Errores comunes
 * 
 * Errores típicos:
 * 
 * "Hoja 'PRODUCTOS' no encontrada"
 *   → Verifica que la pestaña existe en Google Sheet
 *   → Verifica que el nombre es exacto (case-sensitive)
 * 
 * "SPREADSHEET_ID no configurado"
 *   → Ejecuta: inicializarConfiguracion("ID", "FOLDER_ID")
 * 
 * "Headers requeridos no encontrados"
 *   → Ejecuta: verificarHeaders()
 *   → Compara con INTEGRACION.gs
 *   → Agrega los que faltan en Google Sheet
 */

// ════════════════════════════════════════════════════════════════════════════════
// ¡LISTO PARA PRODUCCIÓN!
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Si completaste todos los pasos y reporteSalud() muestra todo en verde:
 * 
 * ✓ Tu sistema WMS está listo para producción
 * ✓ Puedes empezar a registrar clientes y productos
 * ✓ Los movimientos se procesan automáticamente
 * ✓ Los PDFs se generan en tiempo real
 * ✓ Los saldos se cierran automáticamente cada noche
 * 
 * ¡Éxito! 🎉
 */
