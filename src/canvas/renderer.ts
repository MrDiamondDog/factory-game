import { Camera } from "@canvas/camera";
import { loadMachines } from "@objects/loader";
import { drawCircle, line } from "@util/canvas";
import { Log } from "@util/logger";
import { clone } from "@util/object";

import { colors, ctx, elements } from "@/constants";

import { openCtxMenu } from "./contextmenu";
import { Mouse } from "./input";
import { createObject, objects } from "./object";

export const DEBUG = true;
export const FPS = 60;

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
    elements.canvas.width = elements.canvas.clientWidth;
    elements.canvas.height = elements.canvas.clientHeight;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
}

resize();
window.addEventListener("resize", resize);

let start = Date.now();
let ticks = 0;
export let tps = 0;
function draw() {
    ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);

    Camera.begin();

    drawBackground();

    for (const object of objects) {
        if (object.tick) object.tick(object);
    }

    for (const object of objects) {
        object.draw(object);
    }

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
    // requestAnimationFrame(draw);
    setTimeout(draw, 1000 / (FPS * 2));
}

Camera.update();
draw();

// Input listeners
elements.canvas.addEventListener("mousemove", (event: MouseEvent) => {
    const rect = elements.canvas.getBoundingClientRect();

    const oldPos = clone(Mouse.pos);

    Mouse.pos.x = event.clientX - rect.left;
    Mouse.pos.y = event.clientY - rect.top;

    Mouse.worldPos = Camera.screenToWorld(Mouse.pos);

    Mouse.delta.x = (Mouse.pos.x - oldPos.x) / Camera.viewport.scale.x;
    Mouse.delta.y = (Mouse.pos.y - oldPos.y) / Camera.viewport.scale.y;

    Mouse.listener.emit("move", event);
});

elements.canvas.addEventListener("mousedown", (event: MouseEvent) => {
    if (event.button === 0) {
        Mouse.leftDown = true;
    } else if (event.button === 2) {
        Mouse.rightDown = true;
    }

    Mouse.listener.emit("down", event);
});

elements.canvas.addEventListener("mouseup", (event: MouseEvent) => {
    if (event.button === 0) {
        Mouse.leftDown = false;
    } else if (event.button === 2) {
        Mouse.rightDown = false;
    }

    Mouse.listener.emit("up", event);
});

elements.canvas.addEventListener("click", (event: MouseEvent) => {
    Mouse.listener.emit("click", event);
});

elements.canvas.addEventListener("wheel", (event: WheelEvent) => {
    Mouse.listener.emit("wheel", event);
});

elements.canvas.addEventListener("contextmenu", (event: MouseEvent) => {
    event.preventDefault();
    openCtxMenu({
        x: event.clientX,
        y: event.clientY
    });
});

(async () => {
    await loadMachines();

    // initial objects
    createObject("Solar Panel", { x: -450, y: -50 });
    createObject("Solar Panel", { x: -100, y: -200 });
    createObject("Iron Drill", { x: -100, y: -50 });
    createObject("Global Storage", { x: 200, y: -50 });
})();
