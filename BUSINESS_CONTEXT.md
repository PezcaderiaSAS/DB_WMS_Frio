# ❄️ Contexto de Negocio y Reglas de Operación: WMS Cuarto Frío

Este documento define el contexto operativo y las reglas de negocio estrictas para el sistema WMS.

## 🏢 Modelo de Negocio: Renta de Espacios

La empresa alquila espacios en un cuarto frío a terceros. No es un almacén propio, sino un servicio de custodia.

- **Activo Principal**: "Posiciones" de almacenamiento.
- **Unidad de Medida Base**: Kilogramos (kg).

## 📏 Reglas de Inventario y Facturación

### 1. El Concepto de "Posición"

- **Capacidad Estándar**: **800 Kilogramos** por posición.
- **Flexibilidad**: Un cliente puede alquilar desde **1 hasta 15 posiciones** (o más si hay disponibilidad).
- **Pago Base**: Mensualidad por cada posición contratada.
- **Límite Total**: El límite de kilos sin recargo es = `Número de Posiciones * 800`.

### 2. Control de Excesos

El sistema debe permitir que un cliente almacene más de lo contratado, pero debe cobrarlo automáticamente.

- **Umbral**: Cualquier peso > (Número de Posiciones * 800kg).
- **Penalidad**: Se cobra un valor adicional (ej. $19 COP) **por cada kilogramo de exceso, por cada día** que permanezca en bodega.
- **Trazabilidad Diaria**: Es MANDATORIO saber el saldo exacto de kilos al final de cada día para calcular este cobro.

### 3. Requerimientos del Sistema

- **Robustez Relacional**: El sistema debe mantener integridad referencial estricta entre Clientes, Productos y Movimientos.
- **Atomicidad**: Los movimientos de entrada/salida deben ser transaccionales (todo o nada).
- **Reporte al Cliente**: Generación automática de PDFs con el detalle de movimientos y saldo actual.

## 🔄 Flujo de Refacturación

1. **Cierre Diario (Automático)**: El sistema calcula el saldo total de kilos por cliente.
2. **Cálculo**: `Total Kilos - (Posiciones * 800)`.
3. **Registro**: Si el resultado es positivo (hay exceso), se guarda un registro de cobro para ese día.
4. **Facturación**: A fin de mes, se suma la mensualidad fija + la suma de todos los cobros diarios por exceso.
