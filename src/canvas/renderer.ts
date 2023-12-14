import { drawCircle } from "@util/canvas";
import { colors, ctx, elements } from "@/constants";
import { Camera } from "@canvas/camera";
import { Vec2, Object } from "@type/canvas";
import { drawNode } from "./object";

const framerate = 60;

export const objects: Object[] = [];

function drawBackground() {
    ctx.fillStyle = colors.background;
    ctx.fillRect(Camera.viewport.left, Camera.viewport.top, Camera.viewport.width, Camera.viewport.height);

    // DRAW grid of dots
    ctx.fillStyle = colors.backgroundSecondary;
    ctx.strokeStyle = colors.backgroundSecondary;

    const gridSpacing = 100;
    const gridOffset = {
        x: -Camera.lookAt.x % gridSpacing,
        y: -Camera.lookAt.y % gridSpacing
    };

    for (let x = gridOffset.x; x < elements.canvas.width; x += gridSpacing) {
        for (let y = gridOffset.y; y < elements.canvas.height; y += gridSpacing) {
            drawCircle(Camera.screenToWorld({ x, y }), 1);
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

function draw() {
    Camera.begin();

    drawBackground();

    for (const object of objects) {
        drawNode(object);
    }

    Camera.end();

    requestAnimationFrame(draw);
}

draw();