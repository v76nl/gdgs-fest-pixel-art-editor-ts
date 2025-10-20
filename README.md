# Pixel Art Editor

A simple browser-based pixel art editor built with TypeScript and HTML Canvas.  
Supports multiple sprites, undo, eraser, and color palette tools.

## Features

- Editable grid (default 16×16)
- Multiple sprite tabs with instant switching
- Color palette (64 colors)
- Eraser and undo functions
- Console output of canvas data (configurable format)
- Clean and modern UI

## Development

### Setup

```bash
npm install
```

### Run local server

```bash
npx vite
```

Then open the shown localhost URL (e.g. http://localhost:5173).

### Build

```bash
npm run build
```

## Project Structure

```
gdgs-fest-pixel-art-editor-ts/
├─ index.html
├─ style.css
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ .gitignore
├─ README.md
├─ node_modules/
└─ src/
   ├─ main.ts
   ├─ canvas/
   │   ├─ Grid.ts
   │   ├─ Painter.ts
   │   └─ Renderer.ts
   ├─ config/
   │   └─ canvasConfig.ts
   ├─ ui/
   │   ├─ Palette.ts
   │   └─ Toolbar.ts
   ├─ types/
   │   └─ index.d.ts
   └─ utils/
       └─ helpers.ts
```


## Output Options

Canvas changes automatically log data to the console.  
You can configure:
- output scope (single or all sprites)
- color mode (hex or palette index)
- include/exclude empty cells
- format (flat, matrix, or object)
