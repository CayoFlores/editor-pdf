# Editor de PDF

Editor de PDF en el navegador construido con Vue 3 + TypeScript + Vite. Permite cargar un PDF, insertar texto e imágenes editables sobre cada página, y exportar un PDF nuevo con esos elementos fusionados de verdad en el documento — no una captura de pantalla.

## Funcionalidad

- **Cargar PDF**: renderizado página por página con [pdf.js](https://mozilla.github.io/pdf.js/) sobre `<canvas>`, con navegación anterior/siguiente.
- **Insertar imagen**: PNG/JPG arrastrable y redimensionable desde las esquinas.
- **Insertar texto**: caja de texto editable (`contenteditable`), arrastrable y redimensionable, con panel de propiedades (fuente, tamaño, color, negrita/cursiva/subrayado, alineación).
- **Eliminar elementos**: botón `×` sobre el elemento seleccionado, o teclas Delete/Backspace (respetando la edición de texto en curso).
- **Estado por página**: cada página mantiene su propio conjunto de elementos en memoria (Pinia), sin mezclarse al navegar.
- **Exportar PDF**: fusiona texto e imágenes sobre el PDF original con [pdf-lib](https://pdf-lib.js.org/), convirtiendo coordenadas de pantalla (px) a puntos PDF (con inversión del eje Y, ya que PDF mide desde abajo-izquierda) y mapeando las fuentes elegidas a las fuentes estándar de pdf-lib (Helvetica, Times Roman, Courier, con sus variantes bold/italic).

## Stack

- Vue 3 + TypeScript + Vite
- `pdfjs-dist` para renderizar el PDF
- `pdf-lib` para generar el PDF final
- Pinia para el estado global
- Drag & resize implementado a mano (`src/composables/useDragResize.ts`), sin librerías externas

## Cómo correrlo

```sh
npm install
npm run dev
```

### Build de producción

```sh
npm run build
```

### Solo type-check

```sh
npm run type-check
```

## Estructura

- `src/stores/editor.ts` — estado del documento, página actual y elementos por página.
- `src/components/PdfCanvas.vue` — render de pdf.js + overlay de elementos.
- `src/components/DraggableElement.vue` — wrapper genérico de arrastre, resize y borrado.
- `src/components/TextElement.vue` / `ImageElement.vue` — elementos concretos sobre el overlay.
- `src/components/PropertiesPanel.vue` — edición de estilo del texto seleccionado.
- `src/composables/useDragResize.ts` — lógica de drag & resize con pointer events.
- `src/utils/pdfExport.ts` — fusión final con pdf-lib y descarga.

## Limitaciones conocidas

- Solo usa las 14 fuentes estándar de pdf-lib (sin subida de fuentes custom).
- Sin undo/redo.
- Sin tests automatizados todavía.
