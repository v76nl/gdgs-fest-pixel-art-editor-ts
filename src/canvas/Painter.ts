import { Grid } from "./Grid";
import { Renderer } from "./Renderer";
import { CANVAS_CONFIG } from "../config/canvasConfig";

export class Painter {
    grid: Grid;
    renderer: Renderer;
    currentColor: string = "#000000";
    tool: "pen" | "eraser" = "pen";
    isDragging = false;

    constructor(grid: Grid, renderer: Renderer) {
        this.grid = grid;
        this.renderer = renderer;
        this.bindEvents();
    }

    bindEvents() {
        const canvas = this.renderer.ctx.canvas;
        canvas.addEventListener("mousedown", (e) => this.startPaint(e));
        canvas.addEventListener("mousemove", (e) => this.movePaint(e));
        window.addEventListener("mouseup", () => this.endPaint());
    }

    startPaint(e: MouseEvent) {
        this.isDragging = true;
        this.paintAt(e);
    }

    movePaint(e: MouseEvent) {
        if (!this.isDragging) return;
        this.paintAt(e);
    }

    endPaint() {
        this.isDragging = false;
    }

    paintAt(e: MouseEvent) {
        const rect = this.renderer.ctx.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / CANVAS_CONFIG.cellSize);
        const y = Math.floor((e.clientY - rect.top) / CANVAS_CONFIG.cellSize);
        const color = this.tool === "eraser" ? null : this.currentColor;
        this.grid.setCell(x, y, color);
        this.renderer.renderAll();
    }
}
