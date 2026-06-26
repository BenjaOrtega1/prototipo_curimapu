# Curimapu Recepción de Cereales - Contexto del proyecto

## Objetivo

Aplicación SaaS interna para gestionar la recepción de cereales en Curimapu Chillán. El flujo operativo cubre pesaje en romana, análisis de laboratorio, almacenamiento en silo/bodega, planilla general, formularios oficiales y exportaciones.

## Stack

- Frontend: React + Vite.
- Rutas: `react-router-dom`.
- Base de datos/autenticación: Supabase.
- Estilos: Tailwind + `src/styles.css`.
- Animaciones: `motion`, GSAP y microinteracciones CSS.
- Exportación/documentos: `xlsx`, `jspdf`.
- Deploy esperado: Vercel con rewrite SPA en `vercel.json`.

## Flujo principal

1. Login real con Supabase Auth o ingreso en modo demo.
2. Dashboard operativo.
3. Romana registra camión, chofer, proveedor, guía y peso.
4. Laboratorio recibe registros pendientes, completa análisis y aprueba/rechaza.
5. Almacenamiento asigna destino, silo/bodega y estado operativo.
6. Planilla general consolida romana, laboratorio y almacenamiento.
7. Formularios oficiales se generan desde registros operativos.

## Modo demo

El modo demo debe permitir usar todo el sistema sin leer ni escribir información real.

Estado actual:

- La sesión demo se guarda en `sessionStorage` con la llave `curimapu_demo_session`.
- Los datos demo viven solo en memoria del runtime.
- Al refrescar/reiniciar la página, los cambios demo se pierden y el store vuelve vacío.
- Al entrar en demo se reinicia el store demo.
- Al salir de demo se borra el store demo.
- Aunque Supabase esté configurado, los servicios usan datos locales temporales cuando demo está activo.
- Los documentos/formularios demo también usan el store temporal; no leen `curimapu_documentos` desde `localStorage`.
- El usuario demo opera como `admin` para poder probar todo el flujo.

## Roles y permisos

La aplicación separa lectura y escritura por rol. La UI oculta formularios, importaciones y botones de acción cuando el usuario no tiene permiso; Supabase debe reforzar esto con RLS.

Roles:

- `admin`: acceso total, administración de usuarios y auditoría.
- `desarrollador`: acceso total técnico, equivalente a admin para mantenimiento y soporte.
- `romana`: puede crear/modificar romana y proveedores. Puede ver laboratorio, almacenamiento y planilla.
- `laboratorio`: puede crear/modificar análisis de laboratorio. Puede ver romana, almacenamiento y planilla.
- `almacenamiento`: puede crear/modificar almacenamiento. Puede ver romana, laboratorio y planilla.
- `consulta`: solo lectura.

Permisos frontend:

- Definidos en `src/utils/permissions.js`.
- Expuestos por `useAuth()` como `role`, `capabilities`, `can(permission)` e `isAdmin`.
- Las páginas `Romana`, `Laboratorio`, `Almacenamiento` y `Planilla` consultan permisos antes de mostrar formularios/importaciones/acciones.

## Seguridad en Supabase

Archivo principal: `supabase/schema.sql`.

Regla de trabajo:

- Cualquier cambio a la base de datos, schema SQL, RLS, triggers, tablas, vistas o políticas debe informarse explícitamente en el chat.

Incluye:

- Tabla `perfiles` con `rol`.
- Tabla `auditoria_cambios`.
- Columnas de tracking: `created_by`, `updated_by`, `updated_at`.
- Funciones:
  - `current_app_role()`
  - `can_write_area(area)`
  - `can_write_documents()`
  - `set_user_tracking_columns()`
  - `audit_table_change()`
- Triggers de auditoría para proveedores, romana, laboratorio, almacenamiento y documentos.
- RLS por rol para lectura/escritura.

Importante:

- La UI no reemplaza la seguridad. Las políticas RLS deben estar aplicadas en Supabase para impedir escrituras no autorizadas.
- Los usuarios reales necesitan un registro en `perfiles` con su `id` de `auth.users` y el `rol` correcto.
- El trigger `trg_create_profile_for_new_user` crea automáticamente un perfil `consulta` para usuarios nuevos si no se indicó un rol válido en metadata.
- Para habilitar un administrador, actualizar `perfiles.rol = 'admin'` para el usuario correspondiente desde Supabase.
- Para habilitar un desarrollador, actualizar `perfiles.rol = 'desarrollador'` para el usuario correspondiente desde Supabase.

## Assets públicos

Para producción en Vercel, los assets visibles usan rutas absolutas desde `public`:

- Logo: `/logo.png`
- Favicon: `/favicon.png`

El componente `Logo` usa `/logo.png`.

## Deploy Vercel

El proyecto incluye `vercel.json` con rewrite a `index.html` para evitar 404 al recargar rutas internas como `/planilla`.

## Bitácora estructural

### 2026-06-26

- Se creó este documento de contexto vivo.
- Se aisló el modo demo para que no consulte ni escriba datos reales de Supabase.
- Se cambió demo de `localStorage` a `sessionStorage`.
- Se agregó sistema de roles/permisos en frontend.
- Se ocultaron formularios, importaciones y acciones según permisos.
- Se agregó base SQL para RLS por rol y auditoría de cambios.
- Se agregó creación automática de perfiles para usuarios nuevos.

### 2026-06-26 ajuste demo

- Se cambió el almacenamiento de datos demo desde `sessionStorage` a memoria del runtime.
- Se corrigió `documentoService` para que documentos generados en demo no lean documentos locales previos ni datos asociados a sesiones reales.
- Se cambió el inicio del modo demo para que no cargue registros mock de romana, laboratorio, almacenamiento ni documentos.

### 2026-06-26 navegación lateral

- La navbar lateral ahora puede abrirse y cerrarse también en escritorio.
- El contenido principal solo se desplaza cuando el sidebar está abierto.
- El sidebar muestra el sistema bajo el logo y el rol actual del usuario.
- Se retiró el texto `Curimapu Chillán` del bloque de marca lateral.
- Las etiquetas visibles de rol se muestran como `admin`, `romana`, `laboratorio`, `almacenamiento` o `consulta`.

### 2026-06-26 rol desarrollador

- Se agregó el rol `desarrollador`.
- `desarrollador` tiene permisos equivalentes a `admin`.
- Supabase RLS trata `desarrollador` como rol de acceso total técnico.
