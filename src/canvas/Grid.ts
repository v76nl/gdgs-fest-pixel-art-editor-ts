export class Grid {
    cols: number;
    rows: number;
    data: (string | null)[];

    constructor(cols: number, rows: number) {
        this.cols = cols;
        this.rows = rows;
        this.data = new Array(cols * rows).fill(null);
    }

    setCell(x: number, y: number, color: string | null) {
        this.data[y * this.cols + x] = color;
    }

    getCell(x: number, y: number): string | null {
        return this.data[y * this.cols + x];
    }

    clear() {
        this.data.fill(null);
    }
}
