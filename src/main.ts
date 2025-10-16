// ==============================
// Pixel Art Editor (TypeScript版)
// ==============================

// キャンバス基本設定
const gridCols = 16;
const gridRows = 16;
const cellSize = 20;

// カラーパレット定義（64色）
const PALETTE: string[] = [
    "#000000", "#e03c28", "#ffffff", "#d7d7d7", "#a8a8a8", "#7b7b7b", "#343434", "#151515", 
    "#0d2030", "#415d66", "#71a6a1", "#bdffca", "#25e2cd", "#0a98ac", "#005280", "#00604b", 
    "#20b562", "#58d332", "#139d08", "#004e00", "#172808", "#376d03", "#6ab417", "#8cd612", 
    "#beeb71", "#eeffa9", "#b6c121", "#939717", "#cc8f15", "#ffbb31", "#ffe737", "#f68f37", 
    "#ad4e1a", "#231712", "#5c3c0d", "#ae6c37", "#c59782", "#e2d7b5", "#4f1507", "#823c3d", 
    "#da655e", "#e18289", "#f5b784", "#ffe9c5", "#ff82ce", "#cf3c71", "#871646", "#a328b3", 
    "#cc69e4", "#d59cfc", "#fec9ed", "#e2c9ff", "#a675fe", "#6a31ca", "#5a1991", "#211640", 
    "#3d34a5", "#6264dc", "#9ba0ef", "#98dcff", "#5ba8ff", "#0a89ff", "#024aca", "#00177d"
];

// ==============================
// 変数宣言
// ==============================

// キャンバス要素と描画コンテキスト
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;

// ドットデータ保持用
let grid: (string | null)[] = new Array(gridCols * gridRows).fill(null);

// ツール・状態管理
let currentColor = PALETTE[0];
let tool: "pen" | "eraser" = "pen";
let isDragging = false;
let lastCell: { ci: number; ri: number } | null = null;
const undoHistory: string[] = []; // ← window.history と競合しない命名

// ==============================
// 初期化
// ==============================

// main container へキャンバス挿入
const holder = document.getElementById("p5-holder")!;
canvas.width = gridCols * cellSize;
canvas.height = gridRows * cellSize;
holder.appendChild(canvas);

// ------------------------------
// パレット生成
// ------------------------------
function buildPalette() {
    const paletteEl = document.getElementById("palette")!;
    paletteEl.innerHTML = "";

    PALETTE.forEach((color) => {
        const button = document.createElement("button");
        button.className = "color";
        button.style.background = color;
        button.title = color;

        button.addEventListener("click", () => {
            currentColor = color;
            paletteEl.querySelectorAll(".color").forEach(el =>
                el.classList.remove("selected")
            );
            button.classList.add("selected");
            setTool("pen");
        });

        paletteEl.appendChild(button);
    });
}

// ------------------------------
// ツール設定
// ------------------------------
function setTool(name: "pen" | "eraser") {
    tool = name;
    document.getElementById("penBtn")?.classList.toggle("active", tool === "pen");
    document.getElementById("eraserBtn")?.classList.toggle("active", tool === "eraser");
}

// ------------------------------
// 履歴（Undo）
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

// ------------------------------
// 描画
// ------------------------------
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // チェッカー背景
    const checkerSize = cellSize;
    for (let y = 0; y < gridRows; y++) {
        for (let x = 0; x < gridCols; x++) {
            ctx.fillStyle = (x + y) % 2 === 0 ? "#f3f3f3" : "#e8e8e8";
            ctx.fillRect(x * checkerSize, y * checkerSize, checkerSize, checkerSize);
        }
    }

    // ドットを描画
    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
            const color = grid[r * gridCols + c];
            if (color) {
                ctx.fillStyle = color;
                ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
            }
        }
    }

    // 罫線は一時的に非表示
}

// ------------------------------
// 操作処理
// ------------------------------
function getCellIndex(x: number, y: number) {
    const ci = Math.floor(x / cellSize);
    const ri = Math.floor(y / cellSize);
    return { ci, ri };
}

function setCell(ci: number, ri: number, color: string | null) {
    grid[ri * gridCols + ci] = color;
}

function paintAt(x: number, y: number, start = false) {
    const { ci, ri } = getCellIndex(x, y);
    if (ci < 0 || ci >= gridCols || ri < 0 || ri >= gridRows) return;

    if (tool === "eraser") {
        setCell(ci, ri, null);
    } else {
        setCell(ci, ri, currentColor);
    }

    lastCell = { ci, ri };
    drawGrid();
}

// ------------------------------
// イベント登録
// ------------------------------
canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    pushHistory();
    paintAt(e.offsetX, e.offsetY, true);
});

canvas.addEventListener("mousemove", (e) => {
    if (isDragging) paintAt(e.offsetX, e.offsetY);
});

canvas.addEventListener("mouseup", () => {
    isDragging = false;
    lastCell = null;
});

canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const { ci, ri } = getCellIndex(e.offsetX, e.offsetY);
    const picked = grid[ri * gridCols + ci];
    if (picked) {
        currentColor = picked;
        document.querySelectorAll(".color").forEach(el => {
            (el as HTMLElement).classList.toggle(
                "selected",
                (el as HTMLElement).style.background.toLowerCase() === picked.toLowerCase()
            );
        });
        setTool("pen");
    }
});

// ------------------------------
// ボタンイベント
// ------------------------------
document.getElementById("penBtn")?.addEventListener("click", () => setTool("pen"));
document.getElementById("eraserBtn")?.addEventListener("click", () => setTool("eraser"));
document.getElementById("undoBtn")?.addEventListener("click", () => undo());
document.getElementById("clearBtn")?.addEventListener("click", () => {
    pushHistory();
    grid.fill(null);
    drawGrid();
});

// Ctrl/Cmd + Z → Undo
document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
    }
});

// ------------------------------
// 初期化呼び出し
// ------------------------------
buildPalette();
drawGrid();
