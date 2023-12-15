import { Mouse } from "@canvas/input";
import { Vec2 } from "@type/canvas";
import { Log } from "@util/logger";
import { clamp } from "@util/math";

import { ctx } from "@/constants";

export const Camera = {
    distance: 1000,
    lookAt: {
        x: 0,
        y: 0
    } as Vec2,
    fov: Math.PI / 4.0,
    viewport: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        width: 0,
        height: 0,
        scale: {
            x: 1.0,
            y: 1.0
        } as Vec2
    },
    locked: false,
    lock: () => {
        Log("camera", "locked");
        Camera.locked = true;
    },
    unlock: () => {
        Log("camera", "unlocked");
        Camera.locked = false;
    },
    apply: () => {
        ctx.scale(Camera.viewport.scale.x, Camera.viewport.scale.y);
        ctx.translate(-Camera.viewport.left, -Camera.viewport.top);
    },
    update: () => {
        const aspectRatio = ctx.canvas.width / ctx.canvas.height;
        Camera.viewport.width = Camera.distance * Math.tan(Camera.fov);
        Camera.viewport.height = Camera.viewport.width / aspectRatio;
        Camera.viewport.left = Camera.lookAt.x - (Camera.viewport.width / 2.0);
        Camera.viewport.top = Camera.lookAt.y - (Camera.viewport.height / 2.0);
        Camera.viewport.right = Camera.viewport.left + Camera.viewport.width;
        Camera.viewport.bottom = Camera.viewport.top + Camera.viewport.height;
        Camera.viewport.scale.x = ctx.canvas.width / Camera.viewport.width;
        Camera.viewport.scale.y = ctx.canvas.height / Camera.viewport.height;
    },
    moveTo: (pos: Vec2) => {
        Camera.lookAt = pos;
        Camera.update();
    },
    zoomTo: (distance: number) => {
        Camera.distance = distance;
        Camera.update();
    },
    screenToWorld: (pos: Vec2): Vec2 => {
        return {
            x: (pos.x / Camera.viewport.scale.x) + Camera.viewport.left,
            y: (pos.y / Camera.viewport.scale.y) + Camera.viewport.top
        };
    },
    worldToScreen: (pos: Vec2): Vec2 => {
        return {
            x: (pos.x - Camera.viewport.left) * Camera.viewport.scale.x,
            y: (pos.y - Camera.viewport.top) * Camera.viewport.scale.y
        };
    },
    begin: () => {
        ctx.save();
        Camera.apply();
    },
    end: () => {
        ctx.restore();
    }
};

Mouse.listener.on("move", () => {
    if (Camera.locked) return;
    if (Mouse.leftDown) {
        Camera.moveTo(Vec2.sub(Camera.lookAt, Mouse.delta));
    }
});

Mouse.listener.on("wheel", (event: WheelEvent) => {
    if (Camera.locked) return;

    Camera.zoomTo(clamp(Camera.distance + event.deltaY, 100, 10000));
});
