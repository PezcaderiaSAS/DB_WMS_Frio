// ==========================================
// ARCHIVO: Backend_Maestros.gs
// DESCRIPCIÓN: Controlador para Productos y Clientes con validación robusto
// ==========================================

/**
 * ===== MÓDULO PRODUCTOS =====
 * Gestión completa de productos con validación de SKU duplicados,
 * normalización de datos y manejo de concurrencia.
 */

/**
 * Valida los datos del producto antes de guardarlos
 * @param {Object} data - Datos del producto
 * @returns {Object} {válido: boolean, errores: []}
 */
function validarProducto(data) {
  const errores = [];
  
  // Validar SKU
  if (!data.sku || !data.sku.toString().trim()) {
    errores.push("SKU es obligatorio");
  }
  
  // Validar nombre
  if (!data.nombre || !data.nombre.toString().trim()) {
    errores.push("Nombre es obligatorio");
  }
  
  // Validar precio si existe
  if (data.precio && isNaN(parseFloat(data.precio))) {
    errores.push("Precio debe ser un número válido");
  }
  
  // Validar impuesto si existe
  if (data.impuesto && isNaN(parseFloat(data.impuesto))) {
    errores.push("Impuesto debe ser un número válido");
  }
  
  // Validar estado si existe
  const estadosValidos = ["Activo", "Inactivo", "Descontinuado"];
  if (data.estado && !estadosValidos.includes(data.estado)) {
    errores.push(`Estado debe ser uno de: ${estadosValidos.join(", ")}`);
  }
  
  return {
    válido: errores.length === 0,
    errores: errores
  };
}

/**
 * Busca si un SKU ya existe en la hoja de productos
 * @param {string} sku - SKU a buscar
 * @param {string} skuActual - SKU actual (para edición, ignorar este)
 * @returns {boolean} true si el SKU ya existe
 */
function existeSKU(sku, skuActual = null) {
  const ss = getSpreadsheet();
  const ws = ss.getSheetByName(CONFIG.SHEET_PRODUCTOS);
  if (!ws) return false;
  
  const datos = ws.getDataRange().getValues();
  for (let i = 1; i < datos.length; i++) {
    const skuEnHoja = String(datos[i][0]).trim().toUpperCase();
    if (skuEnHoja === sku && skuEnHoja !== skuActual) {
      return true;
    }
  }
  return false;
}

/**
 * CREAR O ACTUALIZAR PRODUCTO
 * Con validación completa, normalización y control de concurrencia.
 */
function guardarProducto(data) {
  const lock = LockService.getScriptLock();
  
  try {
    // Validar datos antes de intentar guardar
    const validación = validarProducto(data);
    if (!validación.válido) {
      throw new Error("Errores de validación: " + validación.errores.join("; "));
    }
    
    // Esperar por candado con timeout
    if (!lock.tryLock(CONFIG.LOCK_TIMEOUT)) {
      throw new Error("No se pudo adquirir bloqueo. Otro usuario está editando. Intenta nuevamente.");
    }
    
    const ss = getSpreadsheet();
    const ws = ss.getSheetByName(CONFIG.SHEET_PRODUCTOS);
    
    if (!ws) throw new Error(`La hoja "${CONFIG.SHEET_PRODUCTOS}" no existe.`);
    
    // ===== NORMALIZACIÓN DE DATOS =====
    const sku = data.sku.toString().trim().toUpperCase();
    const nombre = data.nombre.toString().trim().toUpperCase();
    const categoria = (data.categoria || "General").toString().trim();
    const unidad = (data.unidad || "Unid").toString().trim();
    const estado = data.estado || "Activo";
    const precio = parseFloat(data.precio) || 0;
    const impuesto = parseFloat(data.impuesto) || 0;
    const descripcion = (data.descripcion || "").toString().trim();
    
    const valores = ws.getDataRange().getValues();
    let filaEncontrada = -1;

    // Buscar si ya existe
    for (let i = 1; i < valores.length; i++) {
      if (String(valores[i][0]).trim().toUpperCase() === sku) {
        filaEncontrada = i + 1;
        break;
      }
    }

    if (data.esEdicion) {
      // MODO EDICIÓN
      if (filaEncontrada === -1) {
        throw new Error(`No se encontró producto con SKU: ${sku}`);
      }
      
      // Actualizar fila existente
      // Estructura: [SKU, Nombre, Descripción, Categoría, Unidad, Precio, Impuesto, Estado, FechaActualización]
      const fechaActualizacion = new Date().toLocaleString("es-CO", { timeZone: CONFIG.TIMEZONE });
      
      ws.getRange(filaEncontrada, 1).setValue(sku);              // A: SKU
      ws.getRange(filaEncontrada, 2).setValue(nombre);           // B: Nombre
      ws.getRange(filaEncontrada, 3).setValue(descripcion);      // C: Descripción
      ws.getRange(filaEncontrada, 4).setValue(categoria);        // D: Categoría
      ws.getRange(filaEncontrada, 5).setValue(unidad);           // E: Unidad
      ws.getRange(filaEncontrada, 6).setValue(precio);           // F: Precio
      ws.getRange(filaEncontrada, 7).setValue(impuesto);         // G: Impuesto
      ws.getRange(filaEncontrada, 8).setValue(estado);           // H: Estado
      ws.getRange(filaEncontrada, 9).setValue(fechaActualizacion); // I: FechaActualización
      
      SpreadsheetApp.flush();
      
      return { 
        success: true, 
        message: `Producto '${nombre}' actualizado correctamente.`,
        sku: sku,
        timestamp: new Date()
      };
      
    } else {
      // MODO CREACIÓN
      if (existeSKU(sku)) {
        throw new Error(`El SKU "${sku}" ya existe en el sistema. Usa otro SKU o edita el producto existente.`);
      }
      
      // Crear nueva fila
      const fechaCreacion = new Date().toLocaleString("es-CO", { timeZone: CONFIG.TIMEZONE });
      
      ws.appendRow([
        sku,
        nombre,
        descripcion,
        categoria,
        unidad,
        precio,
        impuesto,
        estado,
        fechaCreacion // FechaCreación
      ]);
      
      SpreadsheetApp.flush();
      
      return { 
        success: true, 
        message: `Producto '${nombre}' creado exitosamente.`,
        sku: sku,
        timestamp: new Date()
      };
    }

  } catch (e) {
    console.error("❌ Error en guardarProducto:", e.message);
    throw new Error(e.message);
  } finally {
    try {
      lock.releaseLock();
    } catch (e) {
      console.warn("⚠️ Error liberando candado:", e.message);
    }
  }
}

/**
 * Obtener lista de productos para selectores/tablas
 */
function obtenerProductos() {
  try {
    const datos = DB.getData(CONFIG.SHEET_PRODUCTOS);
    return datos.map(p => ({
      sku: p.SKU || "",
      nombre: p.Nombre || "",
      categoria: p.Categoría || "",
      precio: p.Precio || 0,
      estado: p.Estado || "Activo"
    }));
  } catch (e) {
    console.error("❌ Error en obtenerProductos:", e.message);
    return [];
  }
}

/**
 * Buscar producto por SKU
 */
function buscarProductoPorSKU(sku) {
  try {
    const skuNormalizado = sku.toString().trim().toUpperCase();
    const datos = DB.getData(CONFIG.SHEET_PRODUCTOS);
    const producto = datos.find(p => 
      String(p.SKU || "").trim().toUpperCase() === skuNormalizado
    );
    return producto || null;
  } catch (e) {
    console.error("❌ Error en buscarProductoPorSKU:", e.message);
    return null;
  }
}



/**
 * ===== MÓDULO CLIENTES =====
 * Gestión completa y robusto de clientes con validación, normalización,
 * control de concurrencia y operaciones CRUD optimizadas.
 */

/**
 * Estructura de un cliente válido:
 * {
 *   id_cliente: string (único, no vacío),
 *   nombre_razon_social: string (requerido),
 *   tipo_documento: string (CC, NIT, CE, etc.),
 *   numero_documento: string,
 *   email: string (válido),
 *   telefono: string,
 *   direccion: string,
 *   ciudad: string,
 *   departamento: string,
 *   pais: string (default: Colombia),
 *   contacto: string,
 *   estado: string (Activo/Inactivo)
 * }
 */

/**
 * Valida los datos del cliente
 * @param {Object} data - Datos del cliente
 * @param {boolean} esEdicion - Si es edición o creación
 * @returns {Object} {válido: boolean, errores: []}
 */
function validarCliente(data, esEdicion = false) {
  const errores = [];
  
  // Validar ID Cliente
  if (!data.id_cliente || !data.id_cliente.toString().trim()) {
    errores.push("ID Cliente es obligatorio");
  }
  
  // Validar nombre/razón social
  if (!data.nombre_razon_social || !data.nombre_razon_social.toString().trim()) {
    errores.push("Nombre o Razón Social es obligatorio");
  }
  
  // Validar email si existe
  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errores.push("Email no válido");
    }
  }
  
  // Validar teléfono (solo números y caracteres permitidos)
  if (data.telefono) {
    const telefonoRegex = /^[0-9+\-() ]+$/;
    if (!telefonoRegex.test(data.telefono)) {
      errores.push("Teléfono contiene caracteres inválidos");
    }
  }
  
  // Validar estado
  const estadosValidos = ["Activo", "Inactivo", "Suspendido"];
  if (data.estado && !estadosValidos.includes(data.estado)) {
    errores.push(`Estado debe ser uno de: ${estadosValidos.join(", ")}`);
  }
  
  return {
    válido: errores.length === 0,
    errores: errores
  };
}

/**
 * Busca si un ID de cliente ya existe
 * @param {string} idCliente - ID a buscar
 * @param {string} idActual - ID actual (para edición, ignorar este)
 * @returns {boolean} true si existe
 */
function existeClientePorID(idCliente, idActual = null) {
  const ss = getSpreadsheet();
  const ws = ss.getSheetByName(CONFIG.SHEET_CLIENTES);
  if (!ws) return false;
  
  const datos = ws.getDataRange().getValues();
  for (let i = 1; i < datos.length; i++) {
    const idEnHoja = String(datos[i][0]).trim();
    if (idEnHoja === idCliente && idEnHoja !== idActual) {
      return true;
    }
  }
  return false;
}

/**
 * Busca si un documento ya existe (duplicado de cliente)
 * @param {string} numeroDocumento - Número de documento
 * @param {string} idActual - ID actual (para edición, ignorar este)
 * @returns {boolean} true si existe
 */
function existeDocumento(numeroDocumento, idActual = null) {
  if (!numeroDocumento || !numeroDocumento.trim()) return false;
  
  const ss = getSpreadsheet();
  const ws = ss.getSheetByName(CONFIG.SHEET_CLIENTES);
  if (!ws) return false;
  
  const datos = ws.getDataRange().getValues();
  const docNormalizado = String(numeroDocumento).trim().toUpperCase();
  
  for (let i = 1; i < datos.length; i++) {
    const docEnHoja = String(datos[i][4] || "").trim().toUpperCase(); // Columna E: NumeroDocumento
    const idEnHoja = String(datos[i][0]).trim();
    if (docEnHoja === docNormalizado && idEnHoja !== idActual) {
      return true;
    }
  }
  return false;
}

/**
 * CREAR O ACTUALIZAR CLIENTE
 * Con validación completa, normalización y control de concurrencia.
 */
function guardarCliente(data) {
  const lock = LockService.getScriptLock();
  
  try {
    // Validar datos
    const validación = validarCliente(data, data.esEdicion || false);
    if (!validación.válido) {
      throw new Error("Errores de validación: " + validación.errores.join("; "));
    }
    
    // Esperar por candado con timeout
    if (!lock.tryLock(CONFIG.LOCK_TIMEOUT)) {
      throw new Error("No se pudo adquirir bloqueo. Otro usuario está editando. Intenta nuevamente.");
    }
    
    const ss = getSpreadsheet();
    let ws = ss.getSheetByName(CONFIG.SHEET_CLIENTES);
    
    // Crear hoja si no existe
    if (!ws) {
      ws = ss.insertSheet(CONFIG.SHEET_CLIENTES);
      ws.appendRow([
        "ID_Cliente",
        "Nombre_RazonSocial",
        "TipoDocumento",
        "NumeroDocumento",
        "Email",
        "Telefono",
        "Direccion",
        "Ciudad",
        "Departamento",
        "Pais",
        "Contacto",
        "Estado",
        "FechaCreacion",
        "FechaActualizacion"
      ]);
    }

    // ===== NORMALIZACIÓN DE DATOS =====
    const idCliente = data.id_cliente.toString().trim();
    const nombre = data.nombre_razon_social.toString().trim().toUpperCase();
    const tipoDocumento = (data.tipo_documento || "CC").toString().trim().toUpperCase();
    const numeroDocumento = (data.numero_documento || "").toString().trim().toUpperCase();
    const email = (data.email || "").toString().trim().toLowerCase();
    const telefono = (data.telefono || "").toString().trim();
    const direccion = (data.direccion || "").toString().trim().toUpperCase();
    const ciudad = (data.ciudad || "Bucaramanga").toString().trim().toUpperCase();
    const departamento = (data.departamento || "Santander").toString().trim().toUpperCase();
    const pais = (data.pais || "Colombia").toString().trim().toUpperCase();
    const contacto = (data.contacto || "").toString().trim().toUpperCase();
    const estado = data.estado || "Activo";
    
    const valores = ws.getDataRange().getValues();
    let filaEncontrada = -1;

    // Buscar si ya existe
    for (let i = 1; i < valores.length; i++) {
      if (String(valores[i][0]).trim() === idCliente) {
        filaEncontrada = i + 1;
        break;
      }
    }

    if (data.esEdicion) {
      // MODO EDICIÓN
      if (filaEncontrada === -1) {
        throw new Error(`No se encontró cliente con ID: ${idCliente}`);
      }
      
      // Validar que no exista otro cliente con el mismo documento
      if (numeroDocumento && existeDocumento(numeroDocumento, idCliente)) {
        throw new Error(`El número de documento "${numeroDocumento}" ya está registrado para otro cliente.`);
      }
      
      const fechaActualizacion = new Date().toLocaleString("es-CO", { timeZone: CONFIG.TIMEZONE });
      
      ws.getRange(filaEncontrada, 1).setValue(idCliente);           // A: ID_Cliente
      ws.getRange(filaEncontrada, 2).setValue(nombre);              // B: Nombre_RazonSocial
      ws.getRange(filaEncontrada, 3).setValue(tipoDocumento);       // C: TipoDocumento
      ws.getRange(filaEncontrada, 4).setValue(numeroDocumento);     // D: NumeroDocumento
      ws.getRange(filaEncontrada, 5).setValue(email);               // E: Email
      ws.getRange(filaEncontrada, 6).setValue(telefono);            // F: Telefono
      ws.getRange(filaEncontrada, 7).setValue(direccion);           // G: Direccion
      ws.getRange(filaEncontrada, 8).setValue(ciudad);              // H: Ciudad
      ws.getRange(filaEncontrada, 9).setValue(departamento);        // I: Departamento
      ws.getRange(filaEncontrada, 10).setValue(pais);               // J: Pais
      ws.getRange(filaEncontrada, 11).setValue(contacto);           // K: Contacto
      ws.getRange(filaEncontrada, 12).setValue(estado);             // L: Estado
      ws.getRange(filaEncontrada, 14).setValue(fechaActualizacion); // N: FechaActualizacion
      
      SpreadsheetApp.flush();
      
      return {
        success: true,
        message: `Cliente '${nombre}' actualizado correctamente.`,
        id_cliente: idCliente,
        timestamp: new Date()
      };
      
    } else {
      // MODO CREACIÓN
      if (existeClientePorID(idCliente)) {
        throw new Error(`El ID de Cliente "${idCliente}" ya existe. Usa otro ID.`);
      }
      
      if (numeroDocumento && existeDocumento(numeroDocumento)) {
        throw new Error(`El número de documento "${numeroDocumento}" ya está registrado.`);
      }
      
      const fechaCreacion = new Date().toLocaleString("es-CO", { timeZone: CONFIG.TIMEZONE });
      
      ws.appendRow([
        idCliente,
        nombre,
        tipoDocumento,
        numeroDocumento,
        email,
        telefono,
        direccion,
        ciudad,
        departamento,
        pais,
        contacto,
        estado,
        fechaCreacion,
        fechaCreacion // FechaActualizacion = FechaCreacion
      ]);
      
      SpreadsheetApp.flush();
      
      return {
        success: true,
        message: `Cliente '${nombre}' creado exitosamente.`,
        id_cliente: idCliente,
        timestamp: new Date()
      };
    }

  } catch (e) {
    console.error("❌ Error en guardarCliente:", e.message);
    throw new Error(e.message);
  } finally {
    try {
      lock.releaseLock();
    } catch (e) {
      console.warn("⚠️ Error liberando candado:", e.message);
    }
  }
}

/**
 * Obtener lista de clientes para selectores/tablas
 */
function obtenerClientes() {
  try {
    const datos = DB.getData(CONFIG.SHEET_CLIENTES);
    return datos.map(c => ({
      id_cliente: c.ID_Cliente || "",
      nombre: c.Nombre_RazonSocial || "",
      email: c.Email || "",
      telefono: c.Telefono || "",
      ciudad: c.Ciudad || "",
      estado: c.Estado || "Activo"
    }));
  } catch (e) {
    console.error("❌ Error en obtenerClientes:", e.message);
    return [];
  }
}

/**
 * Obtener lista simple de clientes (solo ID y nombre) para dropdowns
 */
function obtenerListaClientes() {
  try {
    const ss = getSpreadsheet();
    const ws = ss.getSheetByName(CONFIG.SHEET_CLIENTES);
    if (!ws) return [];
    
    const datos = ws.getDataRange().getValues().slice(1);
    return datos
      .filter(r => String(r[0] || "").trim() && String(r[1] || "").trim()) // Filtrar vacíos
      .map(r => ({ 
        id: r[0], 
        nombre: r[1]
      }));
  } catch (e) {
    console.error("❌ Error en obtenerListaClientes:", e.message);
    return [];
  }
}

/**
 * Buscar cliente por ID
 */
function buscarClientePorID(idCliente) {
  try {
    const datos = DB.getData(CONFIG.SHEET_CLIENTES);
    const cliente = datos.find(c => c.ID_Cliente === idCliente);
    return cliente || null;
  } catch (e) {
    console.error("❌ Error en buscarClientePorID:", e.message);
    return null;
  }
}

/**
 * Buscar clientes por nombre (parcial)
 */
function buscarClientesPorNombre(nombre) {
  try {
    const nombreNormalizado = nombre.toString().trim().toUpperCase();
    const datos = DB.getData(CONFIG.SHEET_CLIENTES);
    return datos.filter(c => 
      String(c.Nombre_RazonSocial || "")
        .trim()
        .toUpperCase()
        .includes(nombreNormalizado)
    );
  } catch (e) {
    console.error("❌ Error en buscarClientesPorNombre:", e.message);
    return [];
  }
}

/**
 * Eliminar cliente (lógicamente - cambiar estado a Inactivo)
 * @param {string} idCliente - ID del cliente a eliminar
 * @returns {Object} Resultado de la operación
 */
function desactivarCliente(idCliente) {
  const lock = LockService.getScriptLock();
  
  try {
    if (!lock.tryLock(CONFIG.LOCK_TIMEOUT)) {
      throw new Error("No se pudo adquirir bloqueo. Intenta nuevamente.");
    }
    
    const cliente = buscarClientePorID(idCliente);
    if (!cliente) {
      throw new Error(`Cliente con ID '${idCliente}' no encontrado.`);
    }
    
    const ss = getSpreadsheet();
    const ws = ss.getSheetByName(CONFIG.SHEET_CLIENTES);
    const rowIndex = cliente._rowIndex;
    
    ws.getRange(rowIndex, 12).setValue("Inactivo"); // Columna L: Estado
    SpreadsheetApp.flush();
    
    return {
      success: true,
      message: `Cliente '${cliente.Nombre_RazonSocial}' desactivado correctamente.`,
      timestamp: new Date()
    };
    
  } catch (e) {
    console.error("❌ Error en desactivarCliente:", e.message);
    throw new Error(e.message);
  } finally {
    try {
      lock.releaseLock();
    } catch (e) {
      console.warn("⚠️ Error liberando candado:", e.message);
    }
  }
}