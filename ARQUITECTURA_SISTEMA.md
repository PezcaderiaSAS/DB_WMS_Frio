# 📐 ARQUITECTURA DEL SISTEMA - DIAGRAMA

## 🏗️ FLUJO GENERAL DEL SISTEMA

```
┌─────────────────────────────────────────────────────────────────┐
│                        WMS CONTROL DE FRÍO                      │
│                    (Google Apps Script + Sheets)                │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Index.html │──→   │   Code.gs    │◄─────│ Formularios  │
│  (Frontend)  │      │  (Punto      │      │  (HTML/CSS)  │
└──────────────┘      │   Entrada)   │      └──────────────┘
                      └──────┬───────┘
                             │
                    ┌────────▼────────┐
                    │ include() para   │
                    │ CSS y JS         │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌───────────────┐  ┌─────────────────┐  ┌──────────────┐
│ Backend_      │  │  DB_Context.gs  │  │  Config.gs   │
│ Maestros.gs   │  │  (Operaciones)  │  │ (Constantes) │
│ (Lógica)      │  │                 │  │              │
└───────────────┘  └────────┬────────┘  └──────────────┘
    │                       │
    │         ┌─────────────┘
    │         │
    ▼         ▼
┌──────────────────────────────┐
│   Google Sheets (Spreadsheet)│
│  ┌────────┬────────┐         │
│  │PRODUCTOS│CLIENTES│ + otros│
│  └────────┴────────┘         │
└──────────────────────────────┘
```

---

## 📦 ESTRUCTURA DE BACKEND_MAESTROS.gs

```
Backend_Maestros.gs
│
├─── MÓDULO PRODUCTOS
│    ├─ validarProducto()
│    │  └─ Valida: SKU, Nombre, Precio, Impuesto, Estado
│    │
│    ├─ existeSKU()
│    │  └─ Previene duplicados (insensible a mayúsculas)
│    │
│    ├─ guardarProducto() [MEJORADO]
│    │  ├─ Valida datos completos
│    │  ├─ Normaliza (MAYÚSCULAS, trim)
│    │  ├─ Previene SKU duplicado
│    │  ├─ Control de concurrencia (tryLock)
│    │  ├─ CREATE: Agrega nueva fila
│    │  └─ UPDATE: Actualiza fila existente
│    │
│    ├─ obtenerProductos()
│    │  └─ Retorna lista de todos los productos
│    │
│    └─ buscarProductoPorSKU()
│       └─ Busca producto específico por SKU
│
└─── MÓDULO CLIENTES [NUEVO]
     ├─ validarCliente()
     │  └─ Valida: ID, Nombre, Email, Teléfono, Estado
     │
     ├─ existeClientePorID()
     │  └─ Previene ID duplicado
     │
     ├─ existeDocumento()
     │  └─ Previene documento duplicado
     │
     ├─ guardarCliente() [MEJORADO]
     │  ├─ Valida datos completos
     │  ├─ Normaliza (MAYÚSCULAS, minúsculas, trim)
     │  ├─ Previene duplicados
     │  ├─ Control de concurrencia
     │  ├─ Auto-crear hoja si no existe
     │  ├─ CREATE: Agrega nueva fila
     │  └─ UPDATE: Actualiza fila existente
     │
     ├─ obtenerClientes()
     │  └─ Retorna lista completa de clientes
     │
     ├─ obtenerListaClientes()
     │  └─ Retorna lista simplificada (para dropdowns)
     │
     ├─ buscarClientePorID()
     │  └─ Busca cliente por ID
     │
     ├─ buscarClientesPorNombre()
     │  └─ Búsqueda parcial por nombre
     │
     └─ desactivarCliente()
        └─ DELETE lógico (cambiar estado)
```

---

## 🔄 CICLO DE VIDA: GUARDAR PRODUCTO

```
Usuario Ingresa Datos
        │
        ▼
┌──────────────────────────────┐
│  Validar con validarProducto()
│  ├─ SKU obligatorio?
│  ├─ Nombre obligatorio?
│  ├─ Precio válido?
│  ├─ Estado válido?
│  └─ Impuesto válido?
└──────┬───────────────────────┘
       │
       ├─→ NO VÁLIDO → Retornar errores
       │
       └─→ VÁLIDO
           │
           ▼
       ┌──────────────────────┐
       │  Adquirir Lock       │
       │ lock.tryLock(30000)  │
       └──────┬───────────────┘
              │
              ├─→ TIMEOUT → Error: "No se pudo adquirir..."
              │
              └─→ OK
                 │
                 ▼
       ┌──────────────────────────────┐
       │ Normalizar Datos             │
       ├─ sku → MAYÚSCULAS + trim     │
       ├─ nombre → MAYÚSCULAS + trim  │
       └─ precio → parseFloat()       │
           │
           ▼
       ┌──────────────────────────────┐
       │ ¿Es Edición?                 │
       └──┬──────────────────────────┬┘
          │ NO                       │ SÍ
          │                          │
          ▼                          ▼
    ┌─────────────┐        ┌──────────────────┐
    │ ¿Existe SKU?│        │ ¿Existe el SKU?  │
    │ existeSKU() │        │                  │
    └──┬──────────┘        └────┬─────────────┘
       │                        │
       ├─→ SÍ → Error           ├─→ NO → Error
       │                        │
       └─→ NO → CREAR           └─→ SÍ → EDITAR
           │                        │
           ▼                        ▼
    appendRow()              updateRange()
           │                        │
           ▼                        ▼
    ┌──────────────────────────────────┐
    │ flush() - Escribir a Sheets      │
    └──────┬───────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────┐
    │ Liberar Lock                     │
    │ lock.releaseLock()               │
    └──────┬───────────────────────────┘
           │
           ▼
    Retornar {success, message, ...}
```

---

## 🔐 CICLO DE CONCURRENCIA

```
USUARIO A                      USUARIO B
│                              │
├─ Intenta lock                ├─ Intenta lock
│  ✓ OBTIENE                   │  ✗ ESPERA
│                              │
├─ Valida datos                │  (esperando...)
├─ Lee Sheets                  │  
├─ Modifica                    │  (esperando...)
├─ flush()                     │
│                              │
├─ lock.releaseLock()          │
│                              │
└─ FIN (A completó)            ├─ lock OBTIENE (finalmente)
                               │
                               ├─ Valida datos
                               ├─ Lee Sheets
                               ├─ Modifica
                               ├─ flush()
                               ├─ lock.releaseLock()
                               │
                               └─ FIN (B completó)

Timeout = 30 segundos
Si B espera > 30 seg → Error: "Timeout adquiriendo bloqueo"
```

---

## 📊 ESTRUCTURA DE DATOS - PRODUCTOS

```
SPREADSHEET
│
└─ SHEET: "PRODUCTOS"
   │
   ├─ Fila 1 (Headers)
   │  └─ SKU │ Nombre │ Descripción │ Categoría │ Unidad │ Precio │ Impuesto │ Estado │ FechaCreacion │
   │
   ├─ Fila 2 (Datos)
   │  └─ PRD-001 │ CAFÉ PREMIUM │ 500gr │ BEBIDAS │ PAQ │ 25000 │ 19 │ Activo │ 16/01/2026 10:30:00 │
   │
   ├─ Fila 3 (Datos)
   │  └─ PRD-002 │ TÉ VERDE │ 100gr │ BEBIDAS │ CAJA │ 18000 │ 19 │ Activo │ 16/01/2026 10:35:00 │
   │
   └─ ...más datos...

Validaciones:
├─ SKU: Requerido, Único, MAYÚSCULAS
├─ Nombre: Requerido, MAYÚSCULAS
├─ Precio: Número (parseFloat)
├─ Impuesto: Número (parseFloat)
└─ Estado: Activo|Inactivo|Descontinuado
```

---

## 📊 ESTRUCTURA DE DATOS - CLIENTES

```
SPREADSHEET
│
└─ SHEET: "CLIENTES"
   │
   ├─ Fila 1 (Headers)
   │  └─ ID_Cliente │ Nombre_RazonSocial │ TipoDocumento │ NumeroDocumento │ Email │ Telefono │ Direccion │ Ciudad │ Departamento │ Pais │ Contacto │ Estado │ FechaCreacion │ FechaActualizacion │
   │
   ├─ Fila 2 (Datos)
   │  └─ CLI-001 │ EMPRESA XYZ LTDA │ NIT │ 900123456789 │ contacto@xyz.com │ +57 7 6424000 │ CARRERA 10 #25-50 │ BUCARAMANGA │ SANTANDER │ COLOMBIA │ JUAN PÉREZ │ Activo │ 16/01/2026 10:30:00 │ 16/01/2026 10:30:00 │
   │
   ├─ Fila 3 (Datos)
   │  └─ CLI-002 │ DISTRIBUIDORA ABC │ NIT │ 900987654321 │ info@abc.com │ +57 7 6500000 │ CARRERA 5 #10-20 │ BUCARAMANGA │ SANTANDER │ COLOMBIA │ MARÍA GARCÍA │ Activo │ 16/01/2026 10:35:00 │ 16/01/2026 10:35:00 │
   │
   └─ ...más datos...

Validaciones:
├─ ID_Cliente: Requerido, Único
├─ Nombre_RazonSocial: Requerido, MAYÚSCULAS
├─ Email: Válido (regex), minúsculas
├─ Telefono: Números y +()-␣
├─ NumeroDocumento: Único
└─ Estado: Activo|Inactivo|Suspendido
```

---

## 🔄 FLUJO DE LECTURA Y BÚSQUEDA

```
obtenerClientes()
        │
        ▼
DB.getData("CLIENTES")
        │
        ├─ Validar hoja existe
        │
        ├─ Leer todas las filas
        │
        ├─ Mapear headers → valores (JSON)
        │
        └─ Agregar _rowIndex (para ediciones)
              │
              ▼
        Return: [{ID_Cliente: "CLI-001", ...}, ...]


buscarClientePorID("CLI-001")
        │
        ▼
DB.getData("CLIENTES")
        │
        ├─ Obtener array de clientes
        │
        ├─ data.find(c => c.ID_Cliente === "CLI-001")
        │
        └─ Retornar cliente o null
              │
              ▼
        Return: {ID_Cliente: "CLI-001", ...} o null
```

---

## 🔗 INTEGRACIÓN CON FRONTEND

```
HTML/JS (Index.html, Formularios)
        │
        ├─ Formulario de Producto
        │  └─ onclick → guardarProducto(formData)
        │
        ├─ Tabla de Productos
        │  └─ onclick cargar → obtenerProductos()
        │
        ├─ Dropdown de Clientes
        │  └─ onload llenar → obtenerListaClientes()
        │
        └─ Búsqueda de Clientes
           └─ onchange buscar → buscarClientesPorNombre(termino)
                 │
                 ▼
        google.script.run.function()
                 │
                 ▼
        Backend_Maestros.gs
                 │
                 ├─ Validar
                 ├─ Normalizar
                 ├─ Guardar/Leer
                 │
                 ▼
        Google Sheets
                 │
                 ▼
        Retornar resultado a Frontend
                 │
                 ▼
        Mostrar en UI (tabla, mensaje, etc)
```

---

## 🔐 ARQUITECTURA DE CONCURRENCIA

```
LockService
    │
    ├─ Document Lock
    │  └─ Bloquea TODO el documento (global)
    │     └─ Usado en: DB.appendRow, updateCell, etc
    │
    └─ Named Lock (disponible pero no usado)
       └─ Podría usarse para locks específicos por hoja
          └─ Ejemplo: LockService.getNamedLock("sheet_PRODUCTOS")


Patrón de Lock Seguro:
┌─────────────────────────────────┐
│ const lock = _getLockForSheet() │
├─────────────────────────────────┤
│ let lockAdquirido = false;      │
│                                 │
│ try {                           │
│   lockAdquirido = lock.tryLock()│
│   if (!lockAdquirido)           │
│     throw new Error("Timeout")  │
│   // OPERACIÓN CRÍTICA          │
│   sheet.appendRow(...)          │
│   flush()                       │
│ } finally {                     │
│   if (lockAdquirido)            │
│     lock.releaseLock()          │
│ }                               │
└─────────────────────────────────┘
```

---

## 📈 FLUJO DE DATOS COMPLETO

```
USUARIO INICIA SESIÓN
        │
        ▼
Index.html carga
        │
        ├─ include(Estilos.html)  [CSS]
        ├─ include(Formulario.html) [HTML]
        ├─ include(JS_Productos.html) [JS]
        ├─ include(JS_Clientes.html) [JS]
        │
        ▼
Interfaz lista para uso
        │
        ├─ Usuario ve Tabla de Productos
        │  └─ Cargada con: obtenerProductos()
        │
        ├─ Usuario ve Dropdown de Clientes
        │  └─ Llenado con: obtenerListaClientes()
        │
        ├─ Usuario entra datos en Formulario
        │  └─ onclick "Guardar" → guardarProducto()
        │
        ├─ Backend valida y normaliza
        │  └─ Si OK: Guarda en Sheets
        │  └─ Si ERROR: Retorna mensaje
        │
        ├─ Frontend muestra resultado
        │  └─ ✅ "Producto guardado" o
        │  └─ ❌ "Error: SKU duplicado"
        │
        └─ Datos persistidos en Google Sheets
```

---

## 🔍 MAPA DE DEPENDENCIAS

```
Index.html (Frontend)
    │
    └─ Code.gs (doGet)
        │
        ├─ Backend_Maestros.gs
        │  ├─ validarProducto()
        │  ├─ validarCliente()
        │  ├─ guardarProducto() ─→ DB.appendRow/updateCell
        │  ├─ guardarCliente()  ─→ DB.appendRow/updateCell
        │  ├─ obtenerProductos() ─→ DB.getData()
        │  ├─ obtenerClientes()  ─→ DB.getData()
        │  └─ ... más funciones
        │
        ├─ DB_Context.gs
        │  ├─ _getLockForSheet() ─→ LockService.getDocumentLock()
        │  ├─ getData() ─→ sheet.getDataRange()
        │  ├─ appendRow() ─→ sheet.appendRow() + lock
        │  ├─ updateCell() ─→ sheet.getRange() + lock
        │  └─ ... más métodos
        │
        ├─ Config.gs
        │  ├─ CONFIG.SHEET_*
        │  ├─ CONFIG.LOCK_TIMEOUT
        │  └─ getSpreadsheet()
        │
        └─ Google Sheets
           ├─ PRODUCTOS (sheet)
           ├─ CLIENTES (sheet)
           └─ Otros...
```

---

**Diagrama Actualizado:** 16 Enero 2026  
**Versión:** 1.0
