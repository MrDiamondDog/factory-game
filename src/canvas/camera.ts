import { Vec2 } from "@type/canvas";
import { Mouse } from "@canvas/input";
import { Log } from "@util/logger";

export const Camera = {
    pos: {
        x: 0,
        y: 0
    } as Vec2,
    zoom: 1,
    locked: false,
    lock: () => {
        Log("camera", "locked");
        Camera.locked = true;
    },
    unlock: () => {
        Log("camera", "unlocked");
        Camera.locked = false;
    },
};

Mouse.listener.on("move", (event: MouseEvent) => {
    if (Camera.locked) return;
    if (Mouse.leftDown) {
        Camera.pos.x -= event.movementX;
        Camera.pos.y -= event.movementY;
    }
});