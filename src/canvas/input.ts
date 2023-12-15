import { Vec2 } from "@type/canvas";
import { EventEmitter } from "@util/eventEmitter";
import { clone } from "@util/object";

import { elements } from "@/constants";

import { Camera } from "./camera";

export const Mouse = {
    pos: {
        x: 0,
        y: 0
    } as Vec2,
    worldPos: {
        x: 0,
        y: 0
    } as Vec2,
    delta: {
        x: 0,
        y: 0
    } as Vec2,
    leftDown: false,
    rightDown: false,
    listener: new EventEmitter(),
    dragging: undefined as any
};

elements.canvas.addEventListener("mousemove", (event: MouseEvent) => {
    const rect = elements.canvas.getBoundingClientRect();

    const oldPos = clone(Mouse.pos);

    Mouse.pos.x = event.clientX - rect.left;
    Mouse.pos.y = event.clientY - rect.top;

    Mouse.worldPos = Camera.screenToWorld(Mouse.pos);

    Mouse.delta = Vec2.sub(Mouse.pos, oldPos);

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
