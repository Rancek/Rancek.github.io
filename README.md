# Rancek — Portafolio de Elias Alejandro Medel Collao

Sitio estático completo, listo para GitHub Pages. No necesita instalación, compilación, servicios externos ni claves. Los recursos visuales están incluidos en `assets/`.

## Vista previa

Abre `index.html` en tu navegador. También puedes usar un servidor estático local. El sitio funciona sin conexión; los enlaces a GitHub y Studios Conari necesitan Internet.

## Publicar en GitHub Pages

1. Inicia sesión en GitHub con la cuenta **Rancek** y crea el repositorio público **Rancek.github.io**. Si ya existe, guarda una copia de su contenido antes de reemplazarlo.
2. Sube **el contenido** de esta carpeta a la raíz del repositorio, conservando la carpeta `assets`. `index.html` debe quedar directamente en la raíz, no dentro de otra carpeta llamada `Rancek.github.io`. Incluye también el archivo vacío `.nojekyll`.
3. Guarda los archivos en la rama `main`.
4. Abre **Settings → Pages → Build and deployment → Source → Deploy from a branch**.
5. Selecciona **main** y **/ (root)**. Pulsa **Save**.
6. Espera a que GitHub complete la publicación y visita https://rancek.github.io/ . GitHub indica que los cambios pueden tardar hasta 10 minutos.

Guía oficial: https://docs.github.com/es/pages/quickstart

## Archivos

- `index.html`: textos, secciones, enlaces y tarjetas.
- `styles.css`: colores, tamaños, diseño responsive y efectos.
- `script.js`: menú móvil, navegación activa y reproducción de GIF.
- `favicon.svg`: icono del sitio.
- `.nojekyll`: entrega directa de archivos estáticos.
- `assets/`: banner, imagen de Studios Conari, GIF originales y vistas estáticas optimizadas.
- `assets/sources.json`: procedencia de cada recurso original.

## Actualizar el portafolio

Edita los textos de `index.html` y guarda los cambios en GitHub. Las tarjetas enlazan al archivo original y hay accesos a los cuatro repositorios completos. Para cambiar un trabajo, sustituye la imagen estática, el GIF indicado en `data-gif` y el enlace del proyecto. Los GIF se reproducen bajo demanda; el botón Detener vuelve a la vista estática. Esto evita descargas pesadas al entrar y permite controlar el movimiento.

Los colores principales se encuentran al inicio de `styles.css`, en `:root`. El sitio respeta la preferencia de movimiento reducido del sistema. El contenido y los enlaces siguen disponibles sin JavaScript; la reproducción controlada de GIF requiere JavaScript.

Contacto usa los canales proporcionados: perfil de GitHub y sitio de Studios Conari. No se ha inventado un correo ni se ha añadido un formulario sin servicio de envío. Puedes incorporar tu correo público con un enlace `mailto:` si lo deseas.

## Créditos

Los trabajos proceden de los repositorios públicos de Rancek y se presentan como parte de su portafolio académico y creativo. La imagen de Studios Conari enlaza a https://studiosconari.github.io/#inicio.

El examen de modelado está basado en un dibujo existente de Dragon Ball. El diseño y personaje original pertenecen a sus autores y titulares. La contribución indicada de Elias Medel es el modelado 3D académico. Este aviso no constituye una autorización de uso de derechos de terceros.

El banner es un recurso de identidad visual proporcionado en el perfil, no una muestra atribuida a cada proyecto. No se aplica una licencia general a los recursos de terceros.


## Currículum en PDF

El CV actualizado está en `assets/CV_Elias_Medel_Rancek_2026.pdf`, con enlaces «Ver currículum (PDF)» en Inicio y Contacto que abren el documento en una pestaña nueva. Para actualizarlo, reemplaza ese PDF conservando el nombre. Para publicar este cambio, sube `index.html`, `styles.css` y el PDF de `assets/` al repositorio.
