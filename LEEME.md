# Happy Ducklings Academy — Smart Classroom Board (v2)

Pizarra inteligente bilingüe (inglés / español) para TV 16:9. Se maneja con el control remoto,
con teclado o con el dedo. No necesita internet después de la primera carga.

## Cómo ponerla en la TV

**GitHub Pages (recomendado)**

1. Sube **todo el contenido de esta carpeta** a un repositorio (por ejemplo `happy-ducklings-board`).
2. En *Settings → Pages* elige la rama `main` y la carpeta `/ (root)`.
3. Abre `https://TU-USUARIO.github.io/happy-ducklings-board/` en el navegador de la TV y presiona **OK**.

La carpeta `dev/` no hace falta en la TV: es el código fuente para seguir modificando.

**Sin internet (USB o PC conectada a la TV):** abre `index.html` con doble clic. Todo funciona igual,
salvo la copia sin conexión automática (no hace falta: los archivos ya están en el disco).

## Control remoto

| Tecla | Qué hace |
|---|---|
| Flechas | Mover el foco (anillo coral) |
| OK / Enter | Elegir |
| Atrás / Back / Esc | Cerrar la ventana abierta |
| Play/Pausa o `M` | Música sí / no |
| `+` y `-` | Volumen |
| Rojo o `A` | Actividades |
| Verde | Herramienta de la actividad (temporizador o lavado de manos) |
| Amarillo o `N` | Siesta / despertar |
| Azul o `S` | Panel de la maestra |
| `Z` zonas · `T` temporizador · `C` recoger · `W` lavar manos · `H` bienvenida · `F` pantalla completa | Atajos de teclado |
| `1` `2` `3`, AvPág / RePág | Pasos de la guía |

En un teléfono en vertical la pizarra se gira sola: ponlo de lado para verla completa.

## Qué hay en la carpeta

```
index.html              la pizarra completa (HTML + CSS + JS en un solo archivo)
sw.js                   copia sin conexión (solo en https)
manifest.webmanifest    para instalarla como app
assets/img/             44 ilustraciones (WebP) sacadas de tus láminas y carteles
assets/audio/           song.m4a (+ .mp3 de respaldo) = tu canción original, sin tocar
                        lullaby.mp3, cleanup.mp3, wash.mp3 = música nueva, original
assets/sfx.js           25 efectos de sonido originales
assets/fonts/           Fredoka y Nunito (licencia SIL OFL, incluida)
dev/                    código fuente y herramientas (ver abajo)
```

## Cambiar cosas

- **Horario, tiempos, sonido, voz, tarjetas:** todo se cambia desde la pizarra, en *Teacher · Maestra*.
  Se guarda solo en esa TV (almacenamiento del navegador).
- **Textos, actividades, pasos de la guía:** están al inicio de `dev/src/app.js`, en la sección `data`.
  Después de editar: `python3 dev/tools/build.py` vuelve a generar `index.html`.
- **Cambiar la canción:** reemplaza `assets/audio/song.m4a` y `song.mp3` con los mismos nombres.
- **Si publicas una versión nueva:** sube el número de `CACHE` en `sw.js` (por ejemplo `hda-board-v3`)
  para que la TV descargue los archivos nuevos.

## Herramientas en `dev/tools/`

| Archivo | Para qué |
|---|---|
| `build.py` | Une `dev/src/style.css + body.html + app.js` en `index.html` |
| `synth.py` | Genera con numpy los 25 efectos y las 3 pistas musicales (WAV) |
| `vec.py`, `crops.py` | Sacan las ilustraciones de los PDF con fondo transparente |
| `upscale.py` | Reescala ×4 las 11 ilustraciones que venían en baja resolución (Real-ESRGAN anime, CPU) |
| `dev/tests/` | Pruebas automáticas con Playwright (control remoto simulado, 80 comprobaciones) |

## Requisitos de la TV

Navegador basado en Chromium 69 o más nuevo (Samsung Tizen 2020+, LG webOS 5+, Android TV / Google TV,
Fire TV con Silk, o cualquier PC). La voz que lee las palabras usa la del propio navegador: si la TV no
trae voz, la pizarra simplemente no habla (todo lo demás funciona).

## Créditos

Ilustraciones: láminas y carteles de Happy Ducklings Academy. Fuentes: Fredoka y Nunito (SIL Open Font License 1.1).
Música nueva y efectos: generados para este proyecto, sin regalías.
