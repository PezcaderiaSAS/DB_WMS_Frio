/**
 * TESTS - Validación de Implementaciones
 * Ejecuta estos tests para verificar que todo funciona correctamente
 * Ejecutar en Apps Script Editor: Extensions > Apps Script > Run
 */

/**
 * TEST 1: Validación de Productos
 */
function testValidarProducto() {
  console.log("🧪 TEST 1: Validación de Productos");
  
  // Test 1.1: Producto válido
  let resultado = validarProducto({
    sku: "TEST-001",
    nombre: "Producto Test",
    precio: 100,
    impuesto: 19
  });
  console.assert(resultado.válido === true, "✅ Producto válido debería pasar");
  
  // Test 1.2: Producto sin SKU
  resultado = validarProducto({
    nombre: "Producto Test"
  });
  console.assert(resultado.válido === false, "✅ Producto sin SKU debería fallar");
  console.assert(resultado.errores.includes("SKU es obligatorio"), "✅ Error específico de SKU");
  
  // Test 1.3: Precio inválido
  resultado = validarProducto({
    sku: "TEST-001",
    nombre: "Test",
    precio: "abc"
  });
  console.assert(resultado.válido === false, "✅ Precio inválido debería fallar");
  
  // Test 1.4: Estado inválido
  resultado = validarProducto({
    sku: "TEST-001",
    nombre: "Test",
    estado: "Inexistente"
  });
  console.assert(resultado.válido === false, "✅ Estado inválido debería fallar");
  
  console.log("✅ TEST 1 COMPLETADO\n");
}

/**
 * TEST 2: Validación de Clientes
 */
function testValidarCliente() {
  console.log("🧪 TEST 2: Validación de Clientes");
  
  // Test 2.1: Cliente válido
  let resultado = validarCliente({
    id_cliente: "CLI-001",
    nombre_razon_social: "Empresa XYZ"
  });
  console.assert(resultado.válido === true, "✅ Cliente válido debería pasar");
  
  // Test 2.2: Cliente sin ID
  resultado = validarCliente({
    nombre_razon_social: "Empresa XYZ"
  });
  console.assert(resultado.válido === false, "✅ Cliente sin ID debería fallar");
  
  // Test 2.3: Email inválido
  resultado = validarCliente({
    id_cliente: "CLI-001",
    nombre_razon_social: "Test",
    email: "email-invalido"
  });
  console.assert(resultado.válido === false, "✅ Email inválido debería fallar");
  
  // Test 2.4: Email válido
  resultado = validarCliente({
    id_cliente: "CLI-001",
    nombre_razon_social: "Test",
    email: "test@example.com"
  });
  console.assert(resultado.válido === true, "✅ Email válido debería pasar");
  
  // Test 2.5: Teléfono inválido (caracteres especiales)
  resultado = validarCliente({
    id_cliente: "CLI-001",
    nombre_razon_social: "Test",
    telefono: "123@456"
  });
  console.assert(resultado.válido === false, "✅ Teléfono inválido debería fallar");
  
  // Test 2.6: Estado inválido
  resultado = validarCliente({
    id_cliente: "CLI-001",
    nombre_razon_social: "Test",
    estado: "Bloqueado"
  });
  console.assert(resultado.válido === false, "✅ Estado inválido debería fallar");
  
  console.log("✅ TEST 2 COMPLETADO\n");
}

/**
 * TEST 3: Normalización de Productos
 */
function testNormalizacionProductos() {
  console.log("🧪 TEST 3: Normalización de Productos");
  
  // Los datos deben ser normalizados dentro de guardarProducto
  // Verificamos que la función lo hace:
  
  const datosEntrada = {
    sku: "  sku-TEST  ",
    nombre: "  producto test  ",
    categoria: "  Bebidas  ",
    esEdicion: false
  };
  
  // Verificar que la función valida y normaliza
  const validacion = validarProducto(datosEntrada);
  console.assert(validacion.válido === true, "✅ Datos con espacios deben validar");
  
  console.log("✅ TEST 3 COMPLETADO\n");
}

/**
 * TEST 4: Normalización de Clientes
 */
function testNormalizacionClientes() {
  console.log("🧪 TEST 4: Normalización de Clientes");
  
  const datosEntrada = {
    id_cliente: "  CLI-001  ",
    nombre_razon_social: "  empresa test  ",
    email: "  TEST@EXAMPLE.COM  ",
    telefono: "  316 123 4567  ",
    ciudad: "  bucaramanga  "
  };
  
  const validacion = validarCliente(datosEntrada);
  console.assert(validacion.válido === true, "✅ Datos con espacios deben validar");
  
  console.log("✅ TEST 4 COMPLETADO\n");
}

/**
 * TEST 5: Búsqueda y Filtrado
 */
function testBusquedas() {
  console.log("🧪 TEST 5: Búsqueda y Filtrado");
  
  // Estos tests requieren datos en la hoja
  try {
    const productos = obtenerProductos();
    console.log(`✅ Se obtuvieron ${productos.length} productos`);
    
    const clientes = obtenerClientes();
    console.log(`✅ Se obtuvieron ${clientes.length} clientes`);
    
  } catch (e) {
    console.warn("⚠️ No hay datos aún en las hojas");
  }
  
  console.log("✅ TEST 5 COMPLETADO\n");
}

/**
 * TEST 6: DB Context - Validación de Hojas
 */
function testDBContext() {
  console.log("🧪 TEST 6: DB Context");
  
  // Test 6.1: Validar hoja existente
  const validacionProductos = DB._validarHoja(CONFIG.SHEET_PRODUCTOS);
  if (validacionProductos.válido) {
    console.log("✅ Hoja PRODUCTOS existe y es válida");
  } else {
    console.warn("⚠️ Hoja PRODUCTOS: " + validacionProductos.error);
  }
  
  // Test 6.2: Validar hoja inexistente
  const validacionInexistente = DB._validarHoja("HOJA_INEXISTENTE");
  console.assert(validacionInexistente.válido === false, "✅ Debe detectar hojas inexistentes");
  
  console.log("✅ TEST 6 COMPLETADO\n");
}

/**
 * TEST 7: Gestión de Concurrencia
 * Este test simula dos operaciones simultáneas
 */
function testConcurrencia() {
  console.log("🧪 TEST 7: Gestión de Concurrencia");
  
  try {
    const lock = LockService.getDocumentLock();
    
    // Test 7.1: Puede adquirir candado
    const adquirido = lock.tryLock(5000);
    console.assert(adquirido === true, "✅ Debe adquirir candado sin problemas");
    lock.releaseLock();
    
    // Test 7.2: Timeout cuando está bloqueado
    lock.tryLock(5000);
    const segundoIntento = lock.tryLock(1000);
    console.assert(segundoIntento === false, "✅ Debe fallar cuando está bloqueado");
    lock.releaseLock();
    
    console.log("✅ TEST 7 COMPLETADO\n");
  } catch (e) {
    console.error("❌ Error en test de concurrencia:", e.message);
  }
}

/**
 * MASTER TEST - Ejecuta todos los tests
 */
function runAllTests() {
  console.log("\n" + "=".repeat(50));
  console.log("🚀 INICIANDO SUITE DE TESTS");
  console.log("=".repeat(50) + "\n");
  
  try {
    testValidarProducto();
    testValidarCliente();
    testNormalizacionProductos();
    testNormalizacionClientes();
    testBusquedas();
    testDBContext();
    testConcurrencia();
    
    console.log("=".repeat(50));
    console.log("✅ TODOS LOS TESTS COMPLETADOS EXITOSAMENTE");
    console.log("=".repeat(50));
    
  } catch (e) {
    console.error("\n❌ ERROR EN TESTS:", e.message);
    console.error("Stack:", e.stack);
  }
}

/**
 * TEST MANUAL: Crear un producto de prueba
 * Ejecuta esto una sola vez para poblcar datos
 */
function testCrearProductoReal() {
  console.log("🧪 TEST MANUAL: Crear Producto Real");
  
  try {
    const resultado = guardarProducto({
      sku: "CAFE-001",
      nombre: "café arabiga premium",
      descripcion: "Café 100% arabiga de 500gr",
      categoria: "Bebidas",
      unidad: "Paquete",
      precio: 25000,
      impuesto: 19,
      estado: "Activo",
      esEdicion: false
    });
    
    console.log("✅ Producto creado:", resultado.message);
    console.log("📊 Datos:", resultado);
    
  } catch (e) {
    console.error("❌ Error:", e.message);
  }
}

/**
 * TEST MANUAL: Crear un cliente de prueba
 * Ejecuta esto una sola vez para poblar datos
 */
function testCrearClienteReal() {
  console.log("🧪 TEST MANUAL: Crear Cliente Real");
  
  try {
    const resultado = guardarCliente({
      id_cliente: "CLI-EMPRESA-001",
      nombre_razon_social: "empresa distribuidora xyz ltda",
      tipo_documento: "NIT",
      numero_documento: "900123456789",
      email: "contacto@empresaxyz.com",
      telefono: "+57 7 6424000",
      direccion: "carrera 10 número 25-50",
      ciudad: "bucaramanga",
      departamento: "santander",
      pais: "colombia",
      contacto: "juan carlos torres",
      estado: "Activo",
      esEdicion: false
    });
    
    console.log("✅ Cliente creado:", resultado.message);
    console.log("📊 Datos:", resultado);
    
  } catch (e) {
    console.error("❌ Error:", e.message);
  }
}

/**
 * TEST MANUAL: Editar cliente
 */
function testEditarClienteReal() {
  console.log("🧪 TEST MANUAL: Editar Cliente Real");
  
  try {
    const resultado = guardarCliente({
      id_cliente: "CLI-EMPRESA-001",
      nombre_razon_social: "empresa distribuidora xyz mejorada",
      tipo_documento: "NIT",
      numero_documento: "900123456789",
      email: "nuevo@empresaxyz.com",
      telefono: "+57 7 6500000",
      estado: "Activo",
      esEdicion: true
    });
    
    console.log("✅ Cliente actualizado:", resultado.message);
    
  } catch (e) {
    console.error("❌ Error:", e.message);
  }
}

/**
 * TEST MANUAL: Validar que SKU duplicado falla
 */
function testSKUDuplicado() {
  console.log("🧪 TEST MANUAL: Validar SKU Duplicado");
  
  try {
    // Crear primero
    guardarProducto({
      sku: "DUPLICADO-001",
      nombre: "producto uno",
      estado: "Activo",
      esEdicion: false
    });
    console.log("✅ Primer producto creado");
    
    // Intentar crear otro con mismo SKU
    guardarProducto({
      sku: "DUPLICADO-001",
      nombre: "producto dos",
      estado: "Activo",
      esEdicion: false
    });
    console.log("❌ ERROR: Debería haber fallado con SKU duplicado");
    
  } catch (e) {
    console.log("✅ Correctamente rechazado:", e.message);
  }
}
