# vision

## Despliegue en Vercel

Configura el directorio raíz del proyecto en Vercel como `programa`. La configuración compila el frontend con Vite y publica las funciones de `programa/api` en las rutas `/api/evaluaciones` y `/api/evaluaciones/:id`.

Para habilitar el almacenamiento persistente:

1. En Supabase, ejecuta [`programa/supabase/schema.sql`](./programa/supabase/schema.sql) en el SQL Editor. El script crea la tabla y carga las ocho evaluaciones de ejemplo.
2. En **Vercel > Project Settings > Environment Variables**, configura `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` con los valores del proyecto Supabase. La clave de servicio solo se usa en las funciones del servidor; no la pongas en variables `VITE_*` ni en el frontend.
3. Vuelve a desplegar el proyecto para aplicar las variables.

Los cambios de favorito, estado y nuevas evaluaciones se guardan en Supabase. Si ambas variables de Supabase no están configuradas, el servidor local conserva el almacenamiento JSON existente.