import { Grid } from "./Grid";
import { CANVAS_CONFIG } from "../config/canvasConfig";

export class Renderer {
    ctx: CanvasRenderingContext2D;
    grid: Grid;

    constructor(ctx: CanvasRenderingContext2D, grid: Grid) {
        this.ctx = ctx;
        this.grid = grid;
    }

    drawBackground() {
        const { ctx, grid } = this;
        for (let y = 0; y < grid.rows; y++) {
            for (let x = 0; x < grid.cols; x++) {
                ctx.fillStyle = (x + y) % 2 === 0 ? "#ebebeb" : "#f8f8f8";
                ctx.fillRect(
                    x * CANVAS_CONFIG.cellSize,
                    y * CANVAS_CONFIG.cellSize,
                    CANVAS_CONFIG.cellSize,
                    CANVAS_CONFIG.cellSize
                );
            }
        }
    }

    drawCells() {
        const { ctx, grid } = this;
        for (let y = 0; y < grid.rows; y++) {
            for (let x = 0; x < grid.cols; x++) {
                const color = grid.getCell(x, y);
                if (color) {
                    ctx.fillStyle = color;
                    ctx.fillRect(
                        x * CANVAS_CONFIG.cellSize,
                        y * CANVAS_CONFIG.cellSize,
                        CANVAS_CONFIG.cellSize,
                        CANVAS_CONFIG.cellSize
                    );
                }
            }
        }
    }

    renderAll() {
        this.ctx.clearRect(0, 0, CANVAS_CONFIG.width, CANVAS_CONFIG.height);
        this.drawBackground();
        this.drawCells();
    }
}
