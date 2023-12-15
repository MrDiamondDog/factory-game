import { Vec2 } from "@type/canvas";
import { EventEmitter } from "@util/eventEmitter";

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
