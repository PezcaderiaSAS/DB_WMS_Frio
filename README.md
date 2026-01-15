# DB_WMS_Frio - Sistema de Gestión de Inventario

Sistema integral de gestión de inventario para almacenes frigoríficos, desarrollado con Google Apps Script y Google Sheets. Automatiza el control de stock, movimientos, facturación y generación de reportes.

![Status](https://img.shields.io/badge/Status-Producción-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Características Principales

- **Control de Inventario en Tiempo Real**: Monitoreo instantáneo de stock en unidades y kilogramos
- **Gestión de Movimientos**: Registro automatizado de entrada, salida y transferencias de productos
- **Facturación Integrada**: Generación automática de facturas por cliente con cálculos precisos
- **Generación de PDFs**: Creación automática de recibos y reportes en formato PDF
- **Dashboard de Reportes**: Resúmenes ejecutivos y análisis de inventario
- **Validación de Datos**: Sistema robusto con verificación de integridad de datos
- **Auditoría Completa**: Registro detallado de todas las operaciones
- **Interfaz Web**: Formularios interactivos para entrada de datos

---

## 🚀 Instalación Rápida

### Requisitos Previos
- Cuenta de Google (Gmail)
- Google Drive activo
- Google Sheets (plantilla incluida)
- Editor de Google Apps Script

### Pasos de Instalación (15 minutos)

1. **Crear Spreadsheet desde la plantilla**
   ```
   Abre Google Sheets
   Importa o crea una hoja con las columnas requeridas
   ```

2. **Obtener IDs necesarios**
   - **Spreadsheet ID**: URL de Google Sheets → `d/[ESTO]`
   - **Folder ID**: Carpeta de Drive para PDFs → `folders/[ESTO]`

3. **Configurar el Script**
   ```javascript
   // En el Editor de Apps Script, ejecuta:
   inicializarConfiguracion("SPREADSHEET_ID_AQUI", "FOLDER_ID_AQUI")
   ```

4. **Verificar Instalación**
   ```javascript
   // Ejecuta este comando para verificar la salud del sistema:
   reporteSalud()
   ```

5. **Dar Permisos**
   - El sistema solicitará permisos de acceso a Sheets y Drive
   - Aprueba los permisos cuando se solicite

---

## 📁 Estructura del Proyecto

```
DB_WMS_Frio/
├── Code.gs                          # Punto de entrada principal
├── Config.gs                        # Configuración y variables globales
├── DB_Context.gs                    # Contexto de datos y gestión de hojas
├── Controller_Movimientos.gs        # Controlador de movimientos de inventario
├── Service_Facturacion.gs           # Servicio de generación de facturas
├── Service_PDF.gs                   # Servicio de generación de PDFs
├── Utils.gs                         # Utilidades y funciones auxiliares
├── INTEGRACION.gs                   # Funciones de integración externa
├── Index.html                       # Interfaz web principal
├── Formulario.html                  # Formularios interactivos
├── JavaScript.html                  # Scripts para la interfaz
├── Estilos.html                     # Estilos CSS
├── Plantilla_Recibo_Batch.html      # Plantilla para recibos
├── Tests.gs                         # Suite de pruebas unitarias
├── GUIA_RAPIDA.gs                   # Guía de inicio rápido
├── VERIFICACION_FINAL.gs            # Script de verificación del sistema
└── README.md                        # Este archivo
```

---

## 🔧 Funciones Principales

### Gestión de Inventario
- `agregarProducto()` - Añade nuevos productos al inventario
- `actualizarStock()` - Actualiza existencias
- `obtenerStock()` - Consulta stock actual
- `generarMovimiento()` - Registra movimientos de entrada/salida

### Facturación
- `generarFactura()` - Crea facturas por cliente
- `obtenerTotalFactura()` - Calcula totales
- `actualizarEstadoFactura()` - Gestiona estado de pago

### Reportes
- `generarReporteDiario()` - Resumen diario
- `generarReporteStock()` - Estado del inventario
- `generarReporteVentas()` - Análisis de ventas

### Utilidades
- `crearPDF()` - Genera archivos PDF
- `enviarEmail()` - Envía reportes por correo
- `validarDatos()` - Verifica integridad de datos

---

## 📊 Estructura de Datos

### Hoja "Inventario"
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id_producto | String | Identificador único |
| nombre | String | Nombre del producto |
| stock_unidades | Number | Cantidad en unidades |
| stock_kilos | Number | Peso en kilogramos |
| precio_unitario | Number | Precio por unidad |
| fecha_actualizacion | Date | Última actualización |

### Hoja "Movimientos"
| Columna | Tipo | Descripción |
|---------|------|-------------|
| id_movimiento | String | ID único |
| fecha | Date | Fecha del movimiento |
| tipo | String | Entrada/Salida/Transferencia |
| id_producto | String | Producto afectado |
| cantidad | Number | Cantidad movida |
| observaciones | String | Notas adicionales |

### Hoja "Facturas"
| Columna | Tipo | Descripción |
|---------|------|-------------|
| numero_factura | String | Número único |
| fecha | Date | Fecha de emisión |
| cliente | String | Nombre del cliente |
| total | Number | Monto total |
| estado | String | Pendiente/Pagado |

---

## 🧪 Testing

### Ejecutar Pruebas
```javascript
// En el Editor de Apps Script:
ejecutarTodasLasPruebas()
```

### Pruebas Incluidas
- ✓ Validación de configuración
- ✓ Operaciones de inventario
- ✓ Cálculos de facturación
- ✓ Generación de reportes
- ✓ Integridad de datos

---

## 🔒 Seguridad

- **Script Properties**: IDs sensibles almacenados de forma segura
- **Validación de Entrada**: Todos los datos se validan antes de procesar
- **Auditoría**: Registro completo de operaciones con timestamps
- **Control de Acceso**: Permisos granulares de Google Apps Script
- **Encriptación**: Datos en tránsito protegidos por Google

---

## 🐛 Solución de Problemas

### Problema: "Configuración no encontrada"
**Solución**: Ejecuta `inicializarConfiguracion()` nuevamente

### Problema: "Hoja no encontrada"
**Solución**: Verifica que las hojas existan: `reporteSalud()`

### Problema: "Error de permiso"
**Solución**: Revisa los permisos en Settings > Permissions del Google Sheet

### Problema: "PDF no se genera"
**Solución**: Verifica que la carpeta de destino exista en Drive

---

## 📚 Documentación Adicional

- **GUIA_RAPIDA.gs** - Inicio en 15 minutos
- **VERIFICACION_FINAL.gs** - Verificar sistema
- **Tests.gs** - Suite de pruebas
- **RESUMEN_FINAL.txt** - Problemas arreglados y mejoras

---

## 🔄 Flujo de Trabajo Típico

1. **Entrada de Stock**: Registra productos recibidos
2. **Gestión de Inventario**: Control diario de existencias
3. **Generación de Movimientos**: Autoriza salidas
4. **Creación de Facturas**: Emite facturas a clientes
5. **Generación de PDFs**: Exporta recibos
6. **Reportes Diarios**: Analiza resultados

---

## 🤝 Soporte y Contacto

- **Email**: pescaderia.2022@gmail.com
- **Empresa**: Pescadería SAS
- **GitHub**: [PezcaderiaSAS](https://github.com/PezcaderiaSAS)

---

## 📝 Registro de Cambios

### v1.0 (Actual)
- ✅ Sistema core de inventario
- ✅ Facturación automática
- ✅ Generación de PDFs
- ✅ Dashboard de reportes
- ✅ Validación robusta

---

## 📄 Licencia

MIT License - Ver detalles en LICENSE

---

## 🙋 Contribuciones

¿Encontraste un bug? ¿Tienes una sugerencia?
Crea un issue o envía un pull request en GitHub.

---

**Última actualización**: Enero 2026  
**Estado**: ✅ Producción - Totalmente Funcional
