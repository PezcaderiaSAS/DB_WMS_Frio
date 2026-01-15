/**
 * Procesa un movimiento con múltiples ítems con validación estricta (Todo o Nada).
 * @param {Object} payload - { cabecera: {idCliente, tipo...}, items: [{idProducto, unidades, kilos}...] }
 */
function procesarMovimientoBatch(payload) {
  const lock = LockService.getScriptLock();
  
  try {
    lock.waitLock(CONFIG.LOCK_TIMEOUT);
    
    const ss = getSpreadsheet();
    const sheetProd = ss.getSheetByName(CONFIG.SHEET_PRODUCTOS);
    
    // 1. LEER TODO EL INVENTARIO EN MEMORIA (Snapshot)
    // Esto es más rápido que buscar uno por uno.
    const dataRange = sheetProd.getDataRange();
    const valoresProd = dataRange.getValues(); // Array 2D
    const headers = valoresProd[0];
    
    // Mapear índices de columnas dinámicamente desde headers
    const colId = headers.indexOf('id_producto');
    const colStockU = headers.indexOf('stock_unidades');
    const colStockK = headers.indexOf('stock_kilos');
    const colNombre = headers.indexOf('nombre_producto');
    const colEmpaque = headers.indexOf('tipo_empaque');
    
    if (colId === -1 || colStockU === -1 || colStockK === -1) {
      throw new Error('Headers requeridos no encontrados en PRODUCTOS. Verifica: id_producto, stock_unidades, stock_kilos');
    }
    
    // Mapear ID de producto a índice de fila para acceso rápido
    const mapaInventario = {};
    for (let i = 1; i < valoresProd.length; i++) {
      const id = valoresProd[i][colId];
      mapaInventario[id] = {
        rowIndex: i,
        filaArr: valoresProd[i],
        colStockU: colStockU,
        colStockK: colStockK
      };
    }

    const itemsProcesados = []; // Para el PDF y Guardado
    const tipo = payload.cabecera.tipo;
    const esSalida = tipo === 'SALIDA';

    // 2. VALIDACIÓN ATÓMICA (En memoria)
    // Recorremos los ítems solicitados. Si uno falla, lanzamos error y NO guardamos nada.
    for (let item of payload.items) {
      const prodEnMemoria = mapaInventario[item.id_producto];
      
      if (!prodEnMemoria) {
        throw new Error(`Producto ${item.id_producto} no existe en base de datos.`);
      }

      let stockActualU = Number(prodEnMemoria.filaArr[prodEnMemoria.colStockU]);
      let stockActualK = Number(prodEnMemoria.filaArr[prodEnMemoria.colStockK]);

      // Verificar Stock si es Salida
      if (esSalida) {
        if (item.unidades > stockActualU) {
          throw new Error(`Fallo de Atomicidad: El producto ${prodEnMemoria.filaArr[2]} no tiene suficientes unidades. (Pides: ${item.unidades}, Hay: ${stockActualU})`);
        }
        if (item.kilos > stockActualK) { // Validación opcional de peso
           throw new Error(`Fallo de Atomicidad: El producto ${prodEnMemoria.filaArr[2]} excede el peso disponible.`);
        }
      }

      // Calcular nuevo stock temporal
      const nuevoU = esSalida ? stockActualU - item.unidades : stockActualU + item.unidades;
      const nuevoK = esSalida ? stockActualK - item.kilos : stockActualK + item.kilos;

      // Actualizar el array en memoria (Aún no en hoja)
      prodEnMemoria.filaArr[prodEnMemoria.colStockU] = nuevoU;
      prodEnMemoria.filaArr[prodEnMemoria.colStockK] = nuevoK;
      
      // Guardar datos enriquecidos para el historial
      itemsProcesados.push({
        ...item,
        nombre: prodEnMemoria.filaArr[colNombre] || 'N/A',
        empaque: prodEnMemoria.filaArr[colEmpaque] || 'N/A',
        saldo_final_u: nuevoU,
        saldo_final_k: nuevoK
      });
    }

    // 3. PERSISTENCIA (Escritura)
    // Si llegamos aquí, la validación pasó. Escribimos todo.

    // A. Actualizar Inventario (Bulk Update)
    // Escribimos toda la matriz de productos de nuevo (rápido para <5000 filas)
    // Opcional: Escribir solo filas cambiadas, pero bulk es más seguro para consistencia.
    sheetProd.getRange(1, 1, valoresProd.length, valoresProd[0].length).setValues(valoresProd);

    // B. Generar ID Único para la Transacción
    const idMovimiento = Utils.generarIdConsecutivo(CONFIG.SHEET_MOVIMIENTOS, "MOV-");

    // C. Generar PDF Único
    const datosPDF = {
      id_movimiento: idMovimiento,
      fecha: Utils.getFechaLegible(),
      cliente: payload.cabecera.nombre_cliente,
      tipo: tipo,
      items: itemsProcesados // Array completo
    };
    const urlPdf = PDFService.generarReciboAgrupado(datosPDF);

    // D. Guardar en Historial (MOVIMIENTOS)
    // Aplanamos los ítems para guardarlos. 
    // Estrategia: Guardar 1 fila por ítem compartiendo el mismo ID de movimiento (Relación 1:N en tabla plana)
    const filasHistorial = itemsProcesados.map(item => [
      idMovimiento,
      new Date(),
      tipo,
      payload.cabecera.id_cliente,
      item.id_producto,
      item.unidades,
      item.kilos,
      item.saldo_final_u,
      item.saldo_final_k,
      urlPdf, // Todos comparten el mismo PDF
      Session.getActiveUser().getEmail()
    ]);

    DB.appendBatch(CONFIG.SHEET_MOVIMIENTOS, filasHistorial);

    return { success: true, id: idMovimiento, url: urlPdf };

  } catch (e) {
    return { success: false, error: e.message };
  } finally {
    lock.releaseLock();
  }
}

function getDatosIniciales() {
  return {
    clientes: DB.getData(CONFIG.SHEET_CLIENTES),
    productos: DB.getData(CONFIG.SHEET_PRODUCTOS)
  };
}

/**
 * Registra múltiples productos de una vez.
 * @param {Array} listaProductos - Array de objetos {id_cliente, nombre, empaque}
 */
function registrarLoteProductos(listaProductos) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    // Generar IDs consecutivos
    let ultimoId = Utils.obtenerUltimoNumeroId(CONFIG.SHEET_PRODUCTOS);
    
    const filasParaGuardar = listaProductos.map(p => {
      ultimoId++;
      const nuevoId = CONFIG.PREFIJO_PRODUCTOS + ultimoId.toString().padStart(4, '0');
      return [
        nuevoId,
        p.id_cliente,
        p.nombre,
        p.empaque,
        0, 0 // Stocks iniciales
      ];
    });

    DB.appendBatch(CONFIG.SHEET_PRODUCTOS, filasParaGuardar);
    return { success: true, count: filasParaGuardar.length };
  } catch (e) {
    return { success: false, error: e.message };
  } finally {
    lock.releaseLock();
  }
}

function registrarCliente(cliente) {
   // Misma lógica simple para 1 cliente, o adaptar batch si necesario
   // ... (Usar código previo adaptado a appendRow)
   const sheet = getSpreadsheet().getSheetByName(CONFIG.SHEET_CLIENTES);
   const id = Utils.generarIdConsecutivo(CONFIG.SHEET_CLIENTES, "CLI-");
   sheet.appendRow([id, cliente.nombre, cliente.email, cliente.limite, cliente.fijo, cliente.variable]);
   return { success: true, id: id, nuevoCliente: {id_cliente: id, nombre_razon_social: cliente.nombre} };
}