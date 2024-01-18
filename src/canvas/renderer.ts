import { Camera } from "@canvas/camera";
import { loadButton, loadMachines } from "@objects/loader";
import { drawCircle, line } from "@util/canvas";
import { Log } from "@util/logger";
import { clone } from "@util/object";

import { canvas, colors, ctx } from "@/constants";

import { openCtxMenu } from "./contextmenu";
import { Mouse } from "./input";
import { objects } from "./object";
import { renderTooltip } from "./tooltip";

export let DEBUG = false;
export const FPS = 60;

export function setDebug(debug: boolean) {
    DEBUG = debug;
}

function drawBackground() {
    ctx.fillStyle = colors.backgroundSecondary;
    ctx.strokeStyle = colors.backgroundSecondary;

    // grid
    const gridSize = 100;
    const gridOffset = {
        x: Camera.viewport.left % gridSize,
        y: Camera.viewport.top % gridSize
    };

    if (Camera.viewport.scale.x > 0.15) {
        for (let x = Camera.viewport.left - gridOffset.x; x < Camera.viewport.right; x += gridSize) {
            line({
                x,
                y: Camera.viewport.top
            }, {
                x,
                y: Camera.viewport.bottom
            });
        }
        for (let y = Camera.viewport.top - gridOffset.y; y < Camera.viewport.bottom; y += gridSize) {
            line({
                x: Camera.viewport.left,
                y
            }, {
                x: Camera.viewport.right,
                y
            });
        }
    } else {
        ctx.lineWidth = 5;
    }

    // axis
    ctx.strokeStyle = colors.text;
    ctx.beginPath();
    line({ x: Camera.viewport.left, y: 0 }, { x: Camera.viewport.right, y: 0 });
    line({ x: 0, y: Camera.viewport.top }, { x: 0, y: Camera.viewport.bottom });
    ctx.stroke();

    // origin
    ctx.fillStyle = colors.text;
    ctx.strokeStyle = colors.text;
    drawCircle({
        x: 0,
        y: 0
    }, 5);
}

function resize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
}

resize();
window.addEventListener("resize", resize);

let start = Date.now();
let ticks = 0;
export let tps = 0;
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    Camera.begin();

    drawBackground();

    for (const object of objects) {
        if (object.tick) object.tick(object);
    }

    for (const object of objects) {
        object.draw(object);
    }
    renderTooltip();

    Camera.end();


    if (DEBUG) {
        ctx.fillStyle = colors.text;
        ctx.strokeStyle = colors.text;
        ctx.font = "20px monospace";
        ctx.fillText(`Mouse: ${Mouse.pos.x}, ${Mouse.pos.y}`, 10, 10);
        ctx.fillText(`World: ${Mouse.worldPos.x}, ${Mouse.worldPos.y}`, 10, 50);
    }

    ticks++;

    // get tps
    const elapsed = Date.now() - start;
    if (elapsed >= 1000) {
        Log("tick", `TPS: ${ticks}`);
        tps = ticks;
        ticks = 0;
        start = Date.now();
    }

    // Using setTimeout allows you to unfocus this tab and still have it run
    // ...but setTimeout ends up being less accurate than requestAnimationFrame, meaning the TPS is all over the place
    requestAnimationFrame(draw);
}

Camera.update();
draw();

// Input listeners
canvas.addEventListener("mousemove", (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();

    const oldPos = clone(Mouse.pos);

    Mouse.pos.x = event.clientX - rect.left;
    Mouse.pos.y = event.clientY - rect.top;

    Mouse.worldPos = Camera.screenToWorld(Mouse.pos);

    Mouse.delta.x = (Mouse.pos.x - oldPos.x) / Camera.viewport.scale.x;
    Mouse.delta.y = (Mouse.pos.y - oldPos.y) / Camera.viewport.scale.y;

    Mouse.listener.emit("move", event);
});

canvas.addEventListener("mousedown", (event: MouseEvent) => {
    if (event.button === 0) {
        Mouse.leftDown = true;
    } else if (event.button === 2) {
        Mouse.rightDown = true;
    }

    Mouse.listener.emit("down", event);
});

canvas.addEventListener("mouseup", (event: MouseEvent) => {
    if (event.button === 0) {
        Mouse.leftDown = false;
    } else if (event.button === 2) {
        Mouse.rightDown = false;
    }

    Mouse.listener.emit("up", event);
});

canvas.addEventListener("click", (event: MouseEvent) => {
    Mouse.listener.emit("click", event);
});

canvas.addEventListener("wheel", (event: WheelEvent) => {
    Mouse.listener.emit("wheel", event);
});

canvas.addEventListener("contextmenu", (event: MouseEvent) => {
    event.preventDefault();
    openCtxMenu({
        x: event.clientX,
        y: event.clientY
    });
});

(async () => {
    await loadMachines();

    loadButton.click();
})();
