# Regalo para Mama

Pagina estatica con carrusel de fotos, frases y musica de fondo para el Dia de las Madres.

## Agregar fotos desde la pagina

Abre la pagina y pulsa `Subir fotos`. Puedes seleccionar varias imagenes a
la vez. Acepta formatos comunes como:

```text
png, jpg, jpeg, jpe, webp, gif, bmp, avif, svg, tif, tiff, heic, heif
```

Las fotos se guardan en el historial del navegador con IndexedDB. Si cierras y
vuelves a abrir la pagina en el mismo navegador, el carrusel seguira creado.

## Proyectar fotos

Despues de subir fotos, usa el boton `Proyectar` para verlas en pantalla
completa. La proyeccion muestra cada imagen completa sin recortarla, aunque las
fotos tengan tamanos u orientaciones diferentes.

## Agregar fotos desde la carpeta

Pon las fotos dentro de `assets/photos` con estos nombres:

```text
foto-1.jpg
foto-2.jpg
foto-3.jpg
```

Tambien funcionan `.jpeg`, `.jpe`, `.png`, `.webp`, `.gif`, `.bmp`, `.avif`,
`.svg`, `.tif`, `.tiff`, `.heic` y `.heif`. La pagina detecta hasta `foto-40`.

## Ver en tu computador

Abre `index.html` en el navegador.

## Subir a GitHub Pages

1. Crea un repositorio en GitHub.
2. Sube todos estos archivos.
3. En GitHub entra a `Settings > Pages`.
4. En `Build and deployment`, elige `Deploy from a branch`.
5. Selecciona la rama `main` y la carpeta `/root`.
6. Guarda los cambios y espera a que GitHub publique el enlace.

## Musica

El sonido esta integrado con el video de YouTube que compartiste. Por reglas del navegador, la persona debe pulsar reproducir para iniciar la musica.
