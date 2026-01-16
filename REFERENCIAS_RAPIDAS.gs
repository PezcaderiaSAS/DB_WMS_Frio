/**
 * REFERENCIA RÁPIDA - Funciones Disponibles
 * 
 * Copiar/pegar estas funciones en tu código frontend (HTML/JS)
 * o usa en Google Apps Script directamente
 */

// ============================================
// PRODUCTOS - QUICK REFERENCE
// ============================================

/**
 * Crear nuevo producto
 * 
 * Uso:
 * guardarProducto({
 *   sku: "PRD-001",
 *   nombre: "Café Premium",
 *   descripcion: "500gr",
 *   categoria: "Bebidas",
 *   unidad: "Paquete",
 *   precio: 25000,
 *   impuesto: 19,
 *   estado: "Activo",
 *   esEdicion: false  // ← Importante para creación
 * })
 * 
 * Respuesta: {success: true, message: "...", sku: "...", timestamp: Date}
 */
// guardarProducto()

/**
 * Editar producto existente
 * 
 * Uso:
 * guardarProducto({
 *   sku: "PRD-001",  // ← SKU del producto a editar
 *   nombre: "Café Premium Mejorado",
 *   precio: 27000,
 *   estado: "Activo",
 *   esEdicion: true  // ← Importante para edición
 * })
 */
// guardarProducto() con esEdicion: true

/**
 * Obtener lista de productos (para tabla)
 * 
 * Retorna: [{sku, nombre, categoria, precio, estado}, ...]
 */
// obtenerProductos()

/**
 * Buscar producto por SKU
 * 
 * Uso: buscarProductoPorSKU("PRD-001")
 * Retorna: {SKU, Nombre, Descripción, Categoría, ..., _rowIndex}
 */
// buscarProductoPorSKU()

/**
 * Validar datos de producto antes de guardar
 * 
 * Uso: validarProducto({...data...})
 * Retorna: {válido: true/false, errores: []}
 */
// validarProducto()

/**
 * Verificar si SKU ya existe
 * 
 * Uso: existeSKU("PRD-001", "SKU_ACTUAL_PARA_EDITAR")
 * Retorna: true/false
 */
// existeSKU()

// ============================================
// CLIENTES - QUICK REFERENCE
// ============================================

/**
 * Crear nuevo cliente
 * 
 * Uso:
 * guardarCliente({
 *   id_cliente: "CLI-001",
 *   nombre_razon_social: "Empresa XYZ Ltda",
 *   tipo_documento: "NIT",
 *   numero_documento: "900123456789",
 *   email: "contacto@xyz.com",
 *   telefono: "+57 7 6424000",
 *   direccion: "Carrera 10 #25-50",
 *   ciudad: "Bucaramanga",
 *   departamento: "Santander",
 *   pais: "Colombia",
 *   contacto: "Juan Pérez",
 *   estado: "Activo",
 *   esEdicion: false  // ← Importante para creación
 * })
 */
// guardarCliente()

/**
 * Editar cliente existente
 * 
 * Uso:
 * guardarCliente({
 *   id_cliente: "CLI-001",  // ← ID del cliente a editar
 *   nombre_razon_social: "Empresa XYZ Mejorada",
 *   email: "nuevo@xyz.com",
 *   telefono: "+57 7 6500000",
 *   estado: "Activo",
 *   esEdicion: true  // ← Importante para edición
 * })
 */
// guardarCliente() con esEdicion: true

/**
 * Obtener lista completa de clientes (para tabla)
 * 
 * Retorna: [{id_cliente, nombre, email, telefono, ciudad, estado}, ...]
 */
// obtenerClientes()

/**
 * Obtener lista simplificada de clientes (para dropdown)
 * 
 * Retorna: [{id, nombre}, ...]
 */
// obtenerListaClientes()

/**
 * Buscar cliente por ID
 * 
 * Uso: buscarClientePorID("CLI-001")
 * Retorna: {ID_Cliente, Nombre_RazonSocial, Email, ..., _rowIndex}
 */
// buscarClientePorID()

/**
 * Buscar clientes por nombre (búsqueda parcial)
 * 
 * Uso: buscarClientesPorNombre("xyz")
 * Retorna: [{ID_Cliente, Nombre_RazonSocial, ...}, ...]
 */
// buscarClientesPorNombre()

/**
 * Desactivar cliente (delete lógico)
 * 
 * Uso: desactivarCliente("CLI-001")
 * Retorna: {success: true, message: "...", timestamp: Date}
 * 
 * Nota: NO elimina datos, solo cambia estado a "Inactivo"
 */
// desactivarCliente()

/**
 * Validar datos de cliente antes de guardar
 * 
 * Uso: validarCliente({...data...})
 * Retorna: {válido: true/false, errores: []}
 */
// validarCliente()

/**
 * Verificar si ID de cliente existe
 * 
 * Uso: existeClientePorID("CLI-001", "ID_ACTUAL_PARA_EDITAR")
 * Retorna: true/false
 */
// existeClientePorID()

/**
 * Verificar si documento existe
 * 
 * Uso: existeDocumento("900123456789", "ID_ACTUAL_PARA_EDITAR")
 * Retorna: true/false
 */
// existeDocumento()

// ============================================
// DB CONTEXT - QUICK REFERENCE
// ============================================

/**
 * Obtener todos los datos de una hoja
 * 
 * Uso: DB.getData("PRODUCTOS")
 * Retorna: [{...}, {...}, ...] (array de objetos)
 */
// DB.getData()

/**
 * Agregar una fila a una hoja
 * 
 * Uso: DB.appendRow("PRODUCTOS", [sku, nombre, ...])
 * Nota: Con concurrencia controlada
 */
// DB.appendRow()

/**
 * Actualizar una celda específica
 * 
 * Uso: DB.updateCell("PRODUCTOS", rowIndex, colIndex, newValue)
 */
// DB.updateCell()

/**
 * Agregar múltiples filas de una vez
 * 
 * Uso: DB.appendBatch("PRODUCTOS", [
 *   [sku1, nombre1, ...],
 *   [sku2, nombre2, ...],
 *   ...
 * ])
 */
// DB.appendBatch()

/**
 * Actualizar todos los datos de una hoja
 * 
 * Uso: DB.updateAllData("PRODUCTOS", values, startRow=2)
 */
// DB.updateAllData()

/**
 * Buscar un registro por ID
 * 
 * Uso: DB.findById("PRODUCTOS", "PRD-001", "SKU")
 * Retorna: {...} o null
 */
// DB.findById()

// ============================================
// CONFIGURACIÓN - QUICK REFERENCE
// ============================================

/**
 * Constantes disponibles en CONFIG
 */
// CONFIG.SHEET_CLIENTES       = "CLIENTES"
// CONFIG.SHEET_PRODUCTOS      = "PRODUCTOS"
// CONFIG.SHEET_MOVIMIENTOS    = "MOVIMIENTOS"
// CONFIG.SHEET_HISTORIAL      = "HISTORIAL_SALDOS_DIARIOS"
// CONFIG.SHEET_DETALLE_MOV    = "DETALLE_MOVIMIENTOS"
// CONFIG.LOCK_TIMEOUT         = 30000 (ms)
// CONFIG.TIMEZONE             = "America/Bogota"

// ============================================
// EJEMPLOS DE ERRORES COMUNES
// ============================================

/**
 * ❌ INCORRECTO:
 * guardarProducto({
 *   sku: "PRD-001"
 *   // Falta esEdicion
 * })
 * → Error: No sabe si crear o editar
 * 
 * ✅ CORRECTO:
 * guardarProducto({
 *   sku: "PRD-001",
 *   esEdicion: false  // ← Agregar esto
 * })
 */

/**
 * ❌ INCORRECTO:
 * guardarCliente({
 *   id_cliente: "CLI-001",
 *   nombre: "xyz"  // ← Campo incorrecto
 * })
 * → Error: Validación falla
 * 
 * ✅ CORRECTO:
 * guardarCliente({
 *   id_cliente: "CLI-001",
 *   nombre_razon_social: "xyz"  // ← Nombre exacto
 * })
 */

/**
 * ❌ INCORRECTO:
 * validarProducto({sku: ""})  // Vacío
 * → {válido: false, errores: ["SKU es obligatorio"]}
 * 
 * ✅ CORRECTO:
 * Validar antes de guardar:
 * const validación = validarProducto(data);
 * if (!validación.válido) {
 *   mostrarError(validación.errores.join(", "));
 *   return;
 * }
 */

// ============================================
// PATRONES DE USO EN FRONTEND
// ============================================

/**
 * Patrón 1: Validar → Guardar → Mostrar resultado
 * 
 * function crearProducto() {
 *   const formData = {
 *     sku: document.getElementById('sku').value,
 *     nombre: document.getElementById('nombre').value,
 *     esEdicion: false
 *   };
 *   
 *   // Validar
 *   const validacion = validarProducto(formData);
 *   if (!validacion.válido) {
 *     alert('Errores: ' + validacion.errores.join(', '));
 *     return;
 *   }
 *   
 *   // Guardar
 *   try {
 *     const resultado = guardarProducto(formData);
 *     alert('✅ ' + resultado.message);
 *     // Recargar tabla
 *   } catch (e) {
 *     alert('❌ Error: ' + e.message);
 *   }
 * }
 */

/**
 * Patrón 2: Llenar dropdown de clientes
 * 
 * function llenarDropdownClientes() {
 *   const clientes = obtenerListaClientes();
 *   const select = document.getElementById('clienteSelect');
 *   
 *   select.innerHTML = '<option>Seleccionar...</option>';
 *   clientes.forEach(c => {
 *     const opt = document.createElement('option');
 *     opt.value = c.id;
 *     opt.textContent = c.nombre;
 *     select.appendChild(opt);
 *   });
 * }
 */

/**
 * Patrón 3: Cargar tabla de productos
 * 
 * function cargarTablaProductos() {
 *   const productos = obtenerProductos();
 *   const tbody = document.querySelector('#productosTable tbody');
 *   
 *   tbody.innerHTML = '';
 *   productos.forEach(p => {
 *     const fila = tbody.insertRow();
 *     fila.innerHTML = `
 *       <td>${p.sku}</td>
 *       <td>${p.nombre}</td>
 *       <td>${p.categoria}</td>
 *       <td>$${p.precio}</td>
 *       <td>${p.estado}</td>
 *     `;
 *   });
 * }
 */

/**
 * Patrón 4: Búsqueda en tiempo real
 * 
 * function buscarClientes(termino) {
 *   if (!termino.trim()) {
 *     cargarTablaClientes(); // Mostrar todos
 *     return;
 *   }
 *   
 *   const resultados = buscarClientesPorNombre(termino);
 *   mostrarResultados(resultados);
 * }
 */

// ============================================
// TESTING RÁPIDO
// ============================================

/**
 * Ejecutar para validar que todo funciona:
 * 
 * 1. En Apps Script Editor
 * 2. Select: runAllTests
 * 3. Run button
 * 4. Ver Console (Ctrl+Enter)
 */

/**
 * O ejecutar manualmente:
 * testValidarProducto()
 * testValidarCliente()
 * testCrearProductoReal()
 * testCrearClienteReal()
 * testSKUDuplicado()
 */

// ============================================
// NOTAS IMPORTANTES
// ============================================

/**
 * 1. CONCURRENCIA:
 *    - Si 2+ usuarios escriben simultáneamente, el sistema usa locks
 *    - Timeout: 30 segundos máximo
 *    - Si alguien sobrepasa, recibe error: "No se pudo adquirir bloqueo"
 * 
 * 2. NORMALIZACIÓN:
 *    - SKU, Nombre, etc. → Se convierten a MAYÚSCULAS automáticamente
 *    - Email → Se convierte a minúsculas automáticamente
 *    - Espacios extras → Se eliminan con trim()
 * 
 * 3. AUDITORÍA:
 *    - FechaCreacion: Se agrega automáticamente al crear
 *    - FechaActualizacion: Se agrega automáticamente en ediciones
 *    - Zona horaria: America/Bogota
 * 
 * 4. DUPLICADOS:
 *    - SKU: No permitido en diferentes productos
 *    - ID Cliente: No permitido en diferentes clientes
 *    - NumeroDocumento: No permitido en diferentes clientes
 * 
 * 5. ERRORES:
 *    - Siempre lanza exception con mensaje claro
 *    - Usa try/catch en tu código
 *    - Revisa console.log() para debugging
 */

// ============================================
// ARCHIVOS DE REFERENCIA
// ============================================

/**
 * 📖 Documentación completa: GUIA_IMPLEMENTACION.md
 * ✅ Checklist de implementación: CHECKLIST_IMPLEMENTACION.md
 * 🧪 Tests: TESTS_VALIDACION.gs
 * 
 * Este archivo: REFERENCIAS_RAPIDAS.gs
 */
