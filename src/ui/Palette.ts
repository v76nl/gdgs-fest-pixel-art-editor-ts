export class Palette {
    colors: string[];
    currentColor: string;
    onColorChange: (color: string) => void;

    constructor(colors: string[], onColorChange: (color: string) => void) {
        this.colors = colors;
        this.currentColor = colors[0];
        this.onColorChange = onColorChange;
        this.build();
    }

    build() {
        const paletteEl = document.getElementById("palette")!;
        paletteEl.innerHTML = "";
        this.colors.forEach((c) => {
            const btn = document.createElement("button");
            btn.className = "color";
            btn.style.background = c;
            btn.addEventListener("click", () => {
                this.currentColor = c;
                this.onColorChange(c);
                document.querySelectorAll(".color").forEach((el) => el.classList.remove("selected"));
                btn.classList.add("selected");
            });
            paletteEl.appendChild(btn);
        });
    }
}
