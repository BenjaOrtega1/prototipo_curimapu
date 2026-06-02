# Curimapu Recepción y Análisis de Cereales

Prototipo académico para digitalizar el flujo observado en planta Curimapu Chillán: romana, laboratorio, almacenamiento y planilla general.

## Flujo funcional

1. El camión ingresa por `Romana / Pesaje`.
2. Se registran patente, chofer, proveedor, guía, número de guía, peso, fecha y hora.
3. El registro queda en estado `Pendiente de laboratorio`.
4. `Laboratorio / Análisis` selecciona el camión pendiente y registra la muestra.
5. Si el resultado es `Rechazado`, el camión queda fuera del proceso.
6. Si el resultado es `Aprobado`, pasa a `Pendiente de almacenamiento`.
7. `Almacenamiento` asigna destino, silo o bodega.
8. `Planilla general` une toda la información y permite exportar Excel, generar PNG e imprimir.

## Ejecutar

```bash
npm install
npm run dev
```

## Logo

El prototipo está preparado para cargar el logo en:

```text
src/assets/logo-curimapu.png
```

Reemplaza ese archivo por el PNG real. Si la imagen no carga, la interfaz muestra `CURIMAPU`.

## Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/schema.sql` en el SQL editor.
3. Copia `.env.example` a `.env`.

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_HUMEDAD_ALERTA=15.0
```

Si no hay variables de Supabase, el sistema usa datos mock en `localStorage`.
