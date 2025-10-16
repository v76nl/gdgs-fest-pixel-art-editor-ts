export const CANVAS_CONFIG = {
    gridCols: 16,
    gridRows: 16,
    cellSize: 20,
    get width() { return this.gridCols * this.cellSize; },
    get height() { return this.gridRows * this.cellSize; }
};
