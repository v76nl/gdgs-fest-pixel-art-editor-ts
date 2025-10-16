// =======================================
// main.ts - Pixel Art Editor (TypeScript版)
// =======================================

// --------------------
// 定数・初期設定
// --------------------
const PALETTE: string[] = [ // 64色パレット
    "#000000", "#e03c28", "#ffffff", "#d7d7d7", "#a8a8a8", "#7b7b7b", "#343434", "#151515",
    "#0d2030", "#415d66", "#71a6a1", "#bdffca", "#25e2cd", "#0a98ac", "#005280", "#00604b",
    "#20b562", "#58d332", "#139d08", "#004e00", "#172808", "#376d03", "#6ab417", "#8cd612",
    "#beeb71", "#eeffa9", "#b6c121", "#939717", "#cc8f15", "#ffbb31", "#ffe737", "#f68f37",
    "#ad4e1a", "#231712", "#5c3c0d", "#ae6c37", "#c59782", "#e2d7b5", "#4f1507", "#823c3d",
    "#da655e", "#e18289", "#f5b784", "#ffe9c5", "#ff82ce", "#cf3c71", "#871646", "#a328b3",
    "#cc69e4", "#d59cfc", "#fec9ed", "#e2c9ff", "#a675fe", "#6a31ca", "#5a1991", "#211640",
    "#3d34a5", "#6264dc", "#9ba0ef", "#98dcff", "#5ba8ff", "#0a89ff", "#024aca", "#00177d"
];

const gridCols = 16;
const gridRows = 16;
const cellSize = 20;

let grid: (string | null)[] = new Array(gridCols * gridRows).fill(null);
let currentColor = PALETTE[0];
let tool: "pen" | "eraser" = "pen";
let isDragging = false;
let lastCell: { c: number; r: number } | null = null;

const undoHistory: string[] = [];

// --------------------
// 初期化処理
// --------------------
window.addEventListener("DOMContentLoaded", () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const holder = document.getElementById("p5-holder")!;
    holder.appendChild(canvas);

    canvas.width = gridCols * cellSize;
    canvas.height = gridRows * cellSize;

    const penBtn = document.getElementById("penBtn")!;
    const eraserBtn = document.getElementById("eraserBtn")!;
    const undoBtn = document.getElementById("undoBtn")!;
    const clearBtn = document.getElementById("clearBtn")!;
    const paletteEl = document.getElementById("palette")!;

    // --------------------
    // カラーパレット生成
    // --------------------
    buildPalette(paletteEl);

    // --------------------
    // 描画関数
    // --------------------
    function drawGrid() {
        // 背景（市松模様）
        for (let j = 0; j < gridRows; j++) {
            for (let i = 0; i < gridCols; i++) {
                ctx.fillStyle = (i + j) % 2 === 0 ? "#ebebeb" : "#f7f7f7";
                ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }

        // セルを描画
        for (let r = 0; r < gridRows; r++) {
            for (let c = 0; c < gridCols; c++) {
                const color = grid[r * gridCols + c];
                if (color) {
                    ctx.fillStyle = color;
                    ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
                }
            }
        }

        // グリッド線
        ctx.strokeStyle = "#ccc";
        ctx.lineWidth = 1;
        for (let c = 0; c <= gridCols; c++) {
            ctx.beginPath();
            ctx.moveTo(c * cellSize + 0.5, 0);
            ctx.lineTo(c * cellSize + 0.5, canvas.height);
            ctx.stroke();
        }
        for (let r = 0; r <= gridRows; r++) {
            ctx.beginPath();
            ctx.moveTo(0, r * cellSize + 0.5);
            ctx.lineTo(canvas.width, r * cellSize + 0.5);
            ctx.stroke();
        }
    }

    // 初期描画
    drawGrid();

    // --------------------
    // 操作関数群
    // --------------------
    function pushHistory() {
        undoHistory.push(JSON.stringify(grid));
    }

    function undo() {
        if (undoHistory.length === 0) return;
        const snap = undoHistory.pop();
        if (!snap) return;
        grid = JSON.parse(snap);
        drawGrid();
    }

    function setTool(name: "pen" | "eraser") {
        tool = name;
        penBtn.classList.toggle("active", tool === "pen");
        eraserBtn.classList.toggle("active", tool === "eraser");
    }

    function setCell(c: number, r: number, color: string | null) {
        grid[r * gridCols + c] = color;
    }

    function paintAt(x: number, y: number, start = false) {
        const c = Math.floor(x / cellSize);
        const r = Math.floor(y / cellSize);
        if (c < 0 || c >= gridCols || r < 0 || r >= gridRows) return;

        if (tool === "eraser") {
            setCell(c, r, null);
        } else {
            setCell(c, r, currentColor);
        }
        lastCell = { c, r };
        drawGrid();
    }

    // --------------------
    // イベント登録
    // --------------------
    canvas.addEventListener("mousedown", e => {
        isDragging = true;
        pushHistory();
        paintAt(e.offsetX, e.offsetY, true);
    });

    canvas.addEventListener("mousemove", e => {
        if (isDragging) paintAt(e.offsetX, e.offsetY);
    });

    canvas.addEventListener("mouseup", () => {
        isDragging = false;
        lastCell = null;
    });

    canvas.addEventListener("contextmenu", e => e.preventDefault());

    penBtn.addEventListener("click", () => setTool("pen"));
    eraserBtn.addEventListener("click", () => setTool("eraser"));
    undoBtn.addEventListener("click", () => undo());
    clearBtn.addEventListener("click", () => {
        pushHistory();
        grid.fill(null);
        drawGrid();
    });

    document.addEventListener("keydown", e => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
            e.preventDefault();
            undo();
        }
    });

    // --------------------
    // カラーパレット生成関数
    // --------------------
    function buildPalette(paletteEl: HTMLElement) {
        paletteEl.innerHTML = "";
        const COLORS_PER_ROW = 8;

        PALETTE.forEach((color, index) => {
            const button = document.createElement("button");
            button.className = "color";
            button.style.background = color;
            button.title = color;

            button.addEventListener("click", () => {
                currentColor = color;
                for (const el of paletteEl.querySelectorAll(".color")) {
                    el.classList.remove("selected");
                }
                button.classList.add("selected");
                setTool("pen");
            });

            paletteEl.appendChild(button);

            // 8色ごとに改行
            if ((index + 1) % COLORS_PER_ROW === 0) {
                const br = document.createElement("div");
                br.className = "palette-break";
                paletteEl.appendChild(br);
            }
        });
    }
});
