import "@objects/index";

import { Camera } from "@canvas/camera";
import { drawCircle, line } from "@util/canvas";
import { clone } from "@util/object";

import { colors, ctx, elements } from "@/constants";

import { Mouse } from "./input";
import { objects } from "./object";

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

    requestAnimationFrame(draw);
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
