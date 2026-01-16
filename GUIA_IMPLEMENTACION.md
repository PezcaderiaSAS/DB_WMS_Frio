# Guía de Implementación - Mejoras WMS Frio

**Fecha:** Enero 16, 2026  
**Estado:** ✅ Completado

---

## 📋 Resumen Ejecutivo

Se han implementado **3 mejoras críticas** al sistema WMS:

1. ✅ **Módulo de Productos Mejorado** - Validación de SKU duplicados + Normalización
2. ✅ **Módulo de Clientes Robusto** - Nuevo módulo completo desde cero
3. ✅ **Control de Concurrencia Reforzado** - LockService en todo el backend

---

## 🎯 Mejora 1: Módulo de Productos Mejorado

### Características Implementadas

#### Validación de Datos
```javascript
validarProducto(data) // Retorna {válido, errores}
```
- ✅ Valida SKU obligatorio
- ✅ Valida Nombre obligatorio
- ✅ Valida Precio (número)
- ✅ Valida Impuesto (número)
- ✅ Valida Estado (Activo/Inactivo/Descontinuado)

#### Prevención de SKU Duplicados
```javascript
existeSKU(sku, skuActual) // Retorna boolean
```
- ✅ Detecta SKU duplicado antes de insertar
- ✅ Permite reutilización del SKU actual en edición
- ✅ Búsqueda insensible a mayúsculas

#### Normalización Automática
- SKU → MAYÚSCULAS + trim
- Nombre → MAYÚSCULAS + trim
- Descripción → Preserva case + trim
- Categoría → trim
- Teléfono → Preserva formato

#### Auditoría Temporal
- **FechaCreación** - Automática al crear
- **FechaActualizacion** - Automática en ediciones
- Zona horaria: America/Bogota

### Estructura de Datos - Productos

| Columna | Campo | Tipo | Requerido |
|---------|-------|------|-----------|
| A | SKU | string | ✅ |
| B | Nombre | string | ✅ |
| C | Descripción | string | ❌ |
| D | Categoría | string | ❌ |
| E | Unidad | string | ❌ |
| F | Precio | number | ❌ |
| G | Impuesto | number | ❌ |
| H | Estado | string | ✅ |
| I | FechaCreacion | datetime | ✅ |

### Uso - Ejemplo Práctico

```javascript
// CREAR PRODUCTO
const resultado = guardarProducto({
  sku: "PRD-001",
  nombre: "café premium",
  descripcion: "Café de 500gr",
  categoria: "Bebidas",
  unidad: "Paq",
  precio: 15000,
  impuesto: 19,
  estado: "Activo",
  esEdicion: false
});

// Respuesta exitosa:
// {
//   success: true,
//   message: "Producto 'CAFÉ PREMIUM' creado exitosamente.",
//   sku: "PRD-001",
//   timestamp: Date
// }

// EDITAR PRODUCTO
const edicion = guardarProducto({
  sku: "PRD-001",
  nombre: "café premium nuevo",
  precio: 16000,
  esEdicion: true
});

// BUSCAR PRODUCTO
const producto = buscarProductoPorSKU("PRD-001");
// Retorna objeto con todas las propiedades

// OBTENER LISTA
const lista = obtenerProductos();
// Retorna array de {sku, nombre, categoria, precio, estado}
```

---

## 🎯 Mejora 2: Módulo de Clientes Robusto

### Características Implementadas

#### Validación Completa
```javascript
validarCliente(data, esEdicion) // Retorna {válido, errores}
```
- ✅ ID Cliente obligatorio y único
- ✅ Nombre/Razón Social obligatorio
- ✅ Email válido (regex)
- ✅ Teléfono válido (solo números y caracteres permitidos)
- ✅ Estado válido (Activo/Inactivo/Suspendido)

#### Prevención de Duplicados
```javascript
existeClientePorID(idCliente, idActual)    // Valida ID único
existeDocumento(numeroDocumento, idActual) // Valida documento único
```
- ✅ No permite dos clientes con mismo ID
- ✅ No permite dos clientes con mismo Número de Documento
- ✅ Permite actualización del documento en edición

#### Normalización de Datos
- ID Cliente → trim
- Nombre/RazonSocial → MAYÚSCULAS + trim
- Tipo Documento → MAYÚSCULAS
- Número Documento → MAYÚSCULAS + trim
- Email → minúsculas (normalización estándar)
- Teléfono → trim (preserva formato)
- Dirección → MAYÚSCULAS + trim
- Ciudad → MAYÚSCULAS + trim
- Departamento → MAYÚSCULAS + trim
- País → MAYÚSCULAS + trim
- Contacto → MAYÚSCULAS + trim

#### Operaciones CRUD
```javascript
guardarCliente(data)           // CREATE/UPDATE
obtenerClientes()              // READ todos
obtenerListaClientes()         // READ simplificado (dropdown)
buscarClientePorID(idCliente)  // READ por ID
buscarClientesPorNombre(nombre) // READ búsqueda parcial
desactivarCliente(idCliente)   // DELETE lógico (Inactivo)
```

#### Auditoría Temporal
- **FechaCreacion** - Automática al crear
- **FechaActualizacion** - Automática en cambios
- Zona horaria: America/Bogota

### Estructura de Datos - Clientes

| Columna | Campo | Tipo | Requerido |
|---------|-------|------|-----------|
| A | ID_Cliente | string | ✅ |
| B | Nombre_RazonSocial | string | ✅ |
| C | TipoDocumento | string | ❌ |
| D | NumeroDocumento | string | ❌ |
| E | Email | string | ❌ |
| F | Telefono | string | ❌ |
| G | Direccion | string | ❌ |
| H | Ciudad | string | ❌ |
| I | Departamento | string | ❌ |
| J | Pais | string | ❌ |
| K | Contacto | string | ❌ |
| L | Estado | string | ✅ |
| M | FechaCreacion | datetime | ✅ |
| N | FechaActualizacion | datetime | ✅ |

### Uso - Ejemplo Práctico

```javascript
// CREAR CLIENTE
const resultado = guardarCliente({
  id_cliente: "CLI-001",
  nombre_razon_social: "empresa xyz ltda",
  tipo_documento: "NIT",
  numero_documento: "900123456",
  email: "contacto@empresaxyz.com",
  telefono: "+57 7 6424000",
  direccion: "carrera 10 #25-50",
  ciudad: "bucaramanga",
  departamento: "santander",
  pais: "colombia",
  contacto: "juan perez",
  estado: "Activo",
  esEdicion: false
});

// Respuesta:
// {
//   success: true,
//   message: "Cliente 'EMPRESA XYZ LTDA' creado exitosamente.",
//   id_cliente: "CLI-001",
//   timestamp: Date
// }

// EDITAR CLIENTE
const edicion = guardarCliente({
  id_cliente: "CLI-001",
  nombre_razon_social: "empresa xyz mejorada",
  estado: "Activo",
  esEdicion: true
});

// BUSCAR CLIENTE
const cliente = buscarClientePorID("CLI-001");

// BUSCAR POR NOMBRE (parcial)
const resultados = buscarClientesPorNombre("xyz");
// Retorna array de clientes que contienen "xyz" en el nombre

// OBTENER LISTA COMPLETA
const todos = obtenerClientes();
// Retorna array de {id_cliente, nombre, email, telefono, ciudad, estado}

// OBTENER LISTA SIMPLIFICADA (dropdowns)
const lista = obtenerListaClientes();
// Retorna array de {id, nombre}

// DESACTIVAR CLIENTE
const inactivo = desactivarCliente("CLI-001");
```

---

## 🎯 Mejora 3: Control de Concurrencia Reforzado

### Cambios en DB_Context.gs

#### Método `_getLockForSheet()`
```javascript
const lock = this._getLockForSheet(sheetName);
```
- ✅ Usa `DocumentLock` para sincronización global
- ✅ Alternativa: `NamedLock` para mayor granularidad
- ✅ Evita deadlocks y race conditions

#### Uso de `tryLock()` vs `waitLock()`
**ANTES (❌ Problemas):**
```javascript
lock.waitLock(10000); // Espera indefinidamente
```

**DESPUÉS (✅ Mejor):**
```javascript
if (!lock.tryLock(CONFIG.LOCK_TIMEOUT)) {
  throw new Error("No se pudo adquirir bloqueo...");
}
```

**Ventajas:**
- ✅ No bloquea indefinidamente
- ✅ Control explícito de fallos
- ✅ Mejor manejo de errores
- ✅ Timeout configurable

#### Pattern Seguro en Todos los Métodos
```javascript
const lock = this._getLockForSheet(sheetName);
let lockAdquirido = false;

try {
  lockAdquirido = lock.tryLock(CONFIG.LOCK_TIMEOUT);
  if (!lockAdquirido) {
    throw new Error("Timeout adquiriendo bloqueo...");
  }
  
  // === OPERACIÓN CRÍTICA ===
  // Solo aquí se toca Google Sheets
  
} catch (e) {
  console.error("❌ Error:", e.message);
  throw e;
} finally {
  if (lockAdquirido) {
    try {
      lock.releaseLock();
    } catch (e) {
      console.warn("⚠️ Error liberando candado:", e.message);
    }
  }
}
```

### Métodos Mejorados

| Método | Cambio | Beneficio |
|--------|--------|-----------|
| `appendRow()` | tryLock → try/finally | Mejor manejo de fallos |
| `updateCell()` | tryLock → try/finally | Evita deadlocks |
| `appendBatch()` | tryLock → try/finally | Escrituras masivas seguras |
| `updateAllData()` | tryLock agregado | Actualización atómica |

### Configuración - CONFIG.gs

```javascript
CONFIG.LOCK_TIMEOUT = 30000; // 30 segundos máximo
```

**Recomendaciones:**
- ⚠️ No aumentar más de 30 segundos (Google tiene límites)
- ⚠️ Si tienes 10+ usuarios simultáneos, reduce a 15000ms
- ⚠️ Monitorea en los logs si hay timeouts frecuentes

---

## 🔄 Flujo de Operación Segura

### Escenario: Dos usuarios guardando datos simultáneamente

```
Usuario A                      Usuario B
│                              │
├─ tryLock (OBTIENE)           ├─ tryLock (ESPERA)
├─ Valida datos                │
├─ Lee hoja                    │
├─ Escribe cambios             │
├─ flush()                     │
├─ releaseLock()               │
│                              ├─ tryLock (OBTIENE)
│                              ├─ ... operaciones ...
│                              ├─ releaseLock()
│                              │
✅ Sincronizado                ✅ Sincronizado
```

---

## 📊 Comparativa: Antes vs Después

| Aspecto | Antes | Después |
|---------|-------|---------|
| **SKU Duplicados** | No validado | ✅ Validado |
| **Normalización** | Parcial | ✅ Completa |
| **Módulo Clientes** | Básico | ✅ Robusto (7 funciones) |
| **Validación Clientes** | Ninguna | ✅ 5 campos validados |
| **Concurrencia** | waitLock (problemático) | ✅ tryLock (seguro) |
| **Auditoría** | No | ✅ Fechas creación/actualización |
| **Manejo de Errores** | Genérico | ✅ Específico por operación |
| **Documentación** | Mínima | ✅ Completa |

---

## 🚀 Próximos Pasos Recomendados

### 1. Pruebas Unitarias
```javascript
// En Tests.gs
function testGuardarProductoConSKUDuplicado() {
  guardarProducto({sku: "TEST-1", nombre: "Test", esEdicion: false});
  guardarProducto({sku: "TEST-1", nombre: "Test2", esEdicion: false}); 
  // Debe lanzar error
}
```

### 2. Pruebas de Concurrencia
```javascript
// Simular múltiples usuarios
// Ejecutar guardarProducto y guardarCliente en paralelo
```

### 3. Migracion de Datos Existentes
- Crear script que renormalice datos actuales
- Validar integridad post-migración
- Backup antes de ejecutar

### 4. UI/UX Mejorado
- Mostrar errores de validación al usuario
- Indicador de "guardando..." durante lock
- Mensajes de éxito/error claros

### 5. Reportes
- Auditoría de cambios (quién cambió qué)
- Historial de clientes/productos
- Análisis de SKU duplicados históricos

---

## 🔧 Troubleshooting

### Error: "No se pudo adquirir bloqueo"
**Causa:** Otro usuario está escribiendo, o timeout agotado  
**Solución:**
1. Esperar unos segundos e intentar nuevamente
2. Si persiste, revisar si hay operación larga en otro usuario
3. Considerar reducir CONFIG.LOCK_TIMEOUT si hay < 5 usuarios

### Error: "Hoja 'PRODUCTOS' no encontrada"
**Causa:** La hoja no existe en el Spreadsheet  
**Solución:**
1. Crear hoja manualmente en Google Sheets
2. O ejecutar función que la cree automáticamente:
```javascript
function crearHojasRequeridas() {
  const ss = getSpreadsheet();
  [CONFIG.SHEET_PRODUCTOS, CONFIG.SHEET_CLIENTES].forEach(hoja => {
    if (!ss.getSheetByName(hoja)) {
      ss.insertSheet(hoja);
    }
  });
}
```

### Email inválido rechazado
**Causa:** Formato de email no cumple regex  
**Solución:** Usar formato estándar: `usuario@dominio.com`

---

## 📞 Soporte y Contacto

Para preguntas o issues:
1. Revisar este documento
2. Revisar comentarios en el código (↓ documentados)
3. Activar modo debug en console.log

---

**Actualizado:** Enero 16, 2026  
**Versión:** 1.0  
**Estado:** Listo para Producción ✅
