import { elements } from "@/constants";
import { Vec2 } from "@type/canvas";
import { EventEmitter } from "@util/eventEmitter";
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
    leftDown: false,
    rightDown: false,
    listener: new EventEmitter(),
    dragging: undefined as any
};

elements.canvas.addEventListener("mousemove", (event: MouseEvent) => {
    Mouse.pos = { x: event.clientX - elements.canvas.offsetLeft, y: event.clientY - elements.canvas.offsetTop };
    Mouse.worldPos = {
        x: Mouse.pos.x + Camera.pos.x,
        y: Mouse.pos.y + Camera.pos.y
    };

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