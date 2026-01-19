/**
 * SERVICIO DE FACTURACIÓN (BATCH NOCTURNO)
 * Se ejecuta vía Trigger (ej. 11:59 PM) para calcular saldos diarios.
 */

function ejecutarCierreDiario() {
  const ss = getSpreadsheet();
  const sheetHistorial = ss.getSheetByName(CONFIG.SHEET_HISTORIAL);
  const productos = DB.getData(CONFIG.SHEET_PRODUCTOS);
  const clientes = DB.getData(CONFIG.SHEET_CLIENTES);
  
  const fechaHoy = new Date();
  
  // 1. Agrupar Inventario por Cliente (FILTRADO por cliente dueño)
  // Creamos un mapa: { "CLI-001": 1500.50 (kg totales), ... }
  let mapaKilosCliente = {};
  
  productos.forEach(prod => {
    let clienteId = prod['id_cliente'];
    let kilos = Number(prod['stock_kilos'] || 0);
    
    // Validar que el producto pertenece al cliente y tiene stock
    if (clienteId && kilos > 0) {
      if (!mapaKilosCliente[clienteId]) {
        mapaKilosCliente[clienteId] = 0;
      }
      mapaKilosCliente[clienteId] += kilos;
    }
  });
  
  // 2. Calcular Costos por Cliente y Guardar
  // Regla: 1 Posición = 800kg ($430k/mes). Exceso = $19/día por Kg extra.
  
  clientes.forEach(cliente => {
    const id = cliente['id_cliente'];
    const kilosTotales = mapaKilosCliente[id] || 0;
    
    // Obtener reglas del cliente o usar defaults
    const limitePosicion = cliente['LimiteKg'] || 800;
    const costoExcesoDia = cliente['CostoExcesoDia'] || 19; 
    
    let kilosExcedente = 0;
    let costoDiaVariable = 0;
    
    // Lógica de Cobro
    if (kilosTotales > limitePosicion) {
      kilosExcedente = kilosTotales - limitePosicion;
      costoDiaVariable = kilosExcedente * costoExcesoDia;
    }
    
    // Guardar registro diario si hay stock o movimiento
    if (kilosTotales > 0) {
      sheetHistorial.appendRow([
        fechaHoy,
        id,
        cliente['nombre_razon_social'],
        kilosTotales,
        limitePosicion,
        kilosExcedente,
        costoDiaVariable // Solo guardamos el costo VARIABLE diario. El fijo es mensual.
      ]);
    }
  });
}

/**
 * Función para instalar el Trigger automáticamente (Ejecutar una sola vez)
 */
function instalarTriggerFacturacion() {
  ScriptApp.newTrigger('ejecutarCierreDiario')
    .timeBased()
    .everyDays(1)
    .atHour(23)
    .nearMinute(30)
    .create();
}