import { drawCircle } from "@util/canvas";
import { colors, ctx, elements } from "@/constants";
import { Camera } from "@canvas/camera";
import { Vec2, Object } from "@type/canvas";
import { drawNode } from "./object";

const framerate = 60;

export const objects: Object[] = [];

function drawBackground() {
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, elements.canvas.width, elements.canvas.height);

    const gridSize = 50;
    const gridOffset: Vec2 = {
        x: Camera.pos.x % gridSize,
        y: Camera.pos.y % gridSize
    };

    ctx.fillStyle = colors.backgroundSecondary;
    for (let x = -gridOffset.x; x < elements.canvas.width; x += gridSize) {
        for (let y = -gridOffset.y; y < elements.canvas.height; y += gridSize) {
            drawCircle({ x, y }, 2.5);
        }
    }
}

function resize() {
    elements.canvas.width = elements.canvas.clientWidth;
    elements.canvas.height = elements.canvas.clientHeight;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
}

resize();
window.addEventListener("resize", resize);

setInterval(async () => {
    // Log("draw", "took " + await time(() => {
    drawBackground();

    for (const object of objects) {
        drawNode(object);
        if (object.draw) object.draw(object);
    }
    // }).then(time => time.time + "ms"));
}, 1000 / framerate);
