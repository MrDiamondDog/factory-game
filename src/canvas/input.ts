import "./tools";

import { CanvasObject, Vec2 } from "@type/canvas";
import { Connection, MaterialIO } from "@type/factory";
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
    dragging: undefined as {
        object: CanvasObject,
        offset?: Vec2,
        io?: {
            type: "input" | "output",
            index: number,
            val: MaterialIO
        }
    } | undefined,
    hovering: undefined as CanvasObject | Connection | undefined,
};
