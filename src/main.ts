// ---- 基本設定 ----
const gridCols = 16;
const gridRows = 16;
const cellSize = 20;

// ---- パレット定義（64色）----
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

// ---- 型定義 ----
interface Sprite {
    id: number;
    name: string;
    grid: (string | null)[];
    undoHistory: string[];
}

// ---- 状態管理 ----
let sprites: Sprite[] = [];
let currentSpriteIndex = 0;
let currentColor = PALETTE[0];
let tool: "pen" | "eraser" = "pen";
let isDragging = false;

// ---- コンソール出力設定 ----
const exportOptions = {
    outputScope: "single" as "single" | "all", // single: 現在のスプライト / all: 全スプライト
    colorMode: "hex" as "hex" | "index", // hex: カラーコード / index: パレット番号
    includeEmpty: false, // false: 空白マスを除外
    format: "object" as "flat" | "matrix" | "object" // flat: 1次元配列, matrix: 2次元配列, object: オブジェクト
};

// ---- キャンバス設定 ----
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;
canvas.width = gridCols * cellSize;
canvas.height = gridRows * cellSize;
document.getElementById("p5-holder")?.appendChild(canvas);

// ---- 初期スプライト ----
function createInitialSprite() {
    sprites.push({
        id: Date.now(),
        name: "1",
        grid: new Array(gridCols * gridRows).fill(null),
        undoHistory: []
    });
}
createInitialSprite();

// ===============================
// UI構築
// ===============================
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
            paletteEl.querySelectorAll(".color").forEach(el => el.classList.remove("selected"));
            button.classList.add("selected");
            setTool("pen");
        });
        paletteEl.appendChild(button);
    });
}

function renderTabs() {
    const tabContainer = document.getElementById("sprite-tabs")!;
    tabContainer.innerHTML = "";

    sprites.forEach((sprite, index) => {
        const btn = document.createElement("button");
        btn.textContent = sprite.name;
        btn.className = "tab-btn" + (index === currentSpriteIndex ? " active" : "");
        btn.addEventListener("click", () => {
            currentSpriteIndex = index;
            drawGrid();
            renderTabs();
        });
        tabContainer.appendChild(btn);
    });

    const addBtn = document.createElement("button");
    addBtn.textContent = "＋";
    addBtn.className = "tab-btn add";
    addBtn.addEventListener("click", addNewSprite);
    tabContainer.appendChild(addBtn);
}

function addNewSprite() {
    const newSprite: Sprite = {
        id: Date.now(),
        name: `${sprites.length + 1}`,
        grid: new Array(gridCols * gridRows).fill(null),
        undoHistory: []
    };
    sprites.push(newSprite);
    currentSpriteIndex = sprites.length - 1;
    renderTabs();
    drawGrid();
}



// ===============================
// 描画処理
// ===============================
function drawGrid() {
    const sprite = sprites[currentSpriteIndex];
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < gridRows; y++) {
        for (let x = 0; x < gridCols; x++) {
            ctx.fillStyle = (x + y) % 2 === 0 ? "#f3f3f3" : "#e8e8e8";
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }

    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
            const color = sprite.grid[r * gridCols + c];
            if (color) {
                ctx.fillStyle = color;
                ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
            }
        }
    }
}

// ===============================
// 出力関数
// ===============================
function outputCanvasState() {
    const exportSprite = (sprite: Sprite) => {
        let output: any;

        // 色変換関数
        const colorValue = (c: string | null) => {
            if (c === null) return exportOptions.includeEmpty ? null : undefined;
            return exportOptions.colorMode === "index"
                ? PALETTE.indexOf(c)
                : c;
        };

        // 出力形式ごとに変換
        if (exportOptions.format === "flat") {
            output = sprite.grid
                .map(colorValue)
                .filter(v => exportOptions.includeEmpty || v !== undefined);
        } else if (exportOptions.format === "matrix") {
            output = [];
            for (let r = 0; r < gridRows; r++) {
                const row = [];
                for (let c = 0; c < gridCols; c++) {
                    const val = colorValue(sprite.grid[r * gridCols + c]);
                    if (val !== undefined || exportOptions.includeEmpty) row.push(val ?? null);
                }
                output.push(row);
            }
        } else if (exportOptions.format === "object") {
            output = {};
            for (let r = 0; r < gridRows; r++) {
                for (let c = 0; c < gridCols; c++) {
                    const val = colorValue(sprite.grid[r * gridCols + c]);
                    if (val !== undefined) {
                        output[`(${c},${r})`] = val;
                    }
                }
            }
        }

        console.log(`🖼️ ${sprite.name}:`, output);
    };

    if (exportOptions.outputScope === "single") {
        exportSprite(sprites[currentSpriteIndex]);
    } else {
        sprites.forEach(exportSprite);
    }
}

// ===============================
// 操作系
// ===============================
function pushHistory() {
    const sprite = sprites[currentSpriteIndex];
    sprite.undoHistory.push(JSON.stringify(sprite.grid));
}

function undo() {
    const sprite = sprites[currentSpriteIndex];
    if (sprite.undoHistory.length === 0) return;
    const snap = sprite.undoHistory.pop();
    if (!snap) return;
    sprite.grid = JSON.parse(snap);
    drawGrid();
    outputCanvasState();
}

function getCellIndex(x: number, y: number) {
    const ci = Math.floor(x / cellSize);
    const ri = Math.floor(y / cellSize);
    return { ci, ri };
}

function setCell(ci: number, ri: number, color: string | null) {
    const sprite = sprites[currentSpriteIndex];
    sprite.grid[ri * gridCols + ci] = color;
}

function paintAt(x: number, y: number) {
    const { ci, ri } = getCellIndex(x, y);
    if (ci < 0 || ci >= gridCols || ri < 0 || ri >= gridRows) return;

    setCell(ci, ri, tool === "eraser" ? null : currentColor);
    drawGrid();
    outputCanvasState();
}

// ===============================
// イベント
// ===============================
canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    pushHistory();
    paintAt(e.offsetX, e.offsetY);
});
canvas.addEventListener("mousemove", (e) => {
    if (isDragging) paintAt(e.offsetX, e.offsetY);
});
canvas.addEventListener("mouseup", () => (isDragging = false));
canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const { ci, ri } = getCellIndex(e.offsetX, e.offsetY);
    const sprite = sprites[currentSpriteIndex];
    const picked = sprite.grid[ri * gridCols + ci];
    if (picked) {
        currentColor = picked;
        document.querySelectorAll(".color").forEach(el =>
            (el as HTMLElement).classList.toggle("selected", (el as HTMLElement).style.background.toLowerCase() === picked.toLowerCase())
        );
        setTool("pen");
    }
});

// ===============================
// ボタン操作
// ===============================
function setTool(name: "pen" | "eraser") {
    tool = name;
    document.getElementById("penBtn")?.classList.toggle("active", tool === "pen");
    document.getElementById("eraserBtn")?.classList.toggle("active", tool === "eraser");
}

document.getElementById("penBtn")?.addEventListener("click", () => setTool("pen"));
document.getElementById("eraserBtn")?.addEventListener("click", () => setTool("eraser"));
document.getElementById("undoBtn")?.addEventListener("click", () => undo());
document.getElementById("clearBtn")?.addEventListener("click", () => {
    pushHistory();
    sprites[currentSpriteIndex].grid.fill(null);
    drawGrid();
    outputCanvasState();
});

document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
    }
});

// ===============================
// 初期化
// ===============================
buildPalette();
renderTabs();
drawGrid();
