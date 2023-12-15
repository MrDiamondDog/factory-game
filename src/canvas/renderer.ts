import "@objects/index";

import { Camera } from "@canvas/camera";

import { colors, ctx, elements } from "@/constants";

import { createObject, objects } from "./object";

function drawBackground() {
    ctx.fillStyle = colors.backgroundSecondary;
    ctx.strokeStyle = colors.backgroundSecondary;
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
        object.draw(object);
    }

    Camera.end();

    requestAnimationFrame(draw);
}

Camera.update();
draw();
createObject("Node");
