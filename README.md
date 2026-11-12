# Travel Hub

Primera base de una PWA personal para gestionar los gastos del viaje.

## Qué incluye esta primera versión
- Presupuesto configurable.
- Registro y eliminación de gastos.
- Categorías y fechas.
- Vistas de gastos personales y compartidos.
- Moneda principal configurable (GBP/EUR).
- Datos guardados localmente en el navegador.
- Configuración PWA para instalación y caché de la aplicación.

## Ejecutar en local
Requiere Node.js 20 o superior.

```bash
npm install
npm run dev
```

## Publicar gratis en GitHub Pages
1. Crea un repositorio público llamado `travel-hub`.
2. Sube el contenido de esta carpeta a la rama `main`.
3. En Settings > Pages, selecciona GitHub Actions como fuente.
4. El flujo `.github/workflows/deploy.yml` construye y publica la aplicación.
5. La dirección será `https://TU-USUARIO.github.io/travel-hub/`.

Si cambias el nombre del repositorio, ajusta `base` en `vite.config.js`.

## Instalar en Android
Abre la dirección publicada con Chrome en Android y usa el menú ⋮ > Instalar aplicación (o Añadir a pantalla de inicio).

## Privacidad y límites
Los gastos se guardan en el almacenamiento local del navegador. No hay cuentas ni sincronización entre móviles. Si borras los datos del sitio o cambias de navegador/dispositivo, puedes perderlos; se añadirá exportación y copia de seguridad en una siguiente fase.

El modo sin conexión cachea los archivos de la aplicación, pero las funciones de mapa y búsqueda de lugares aún no están implementadas.
