import { defineObject } from "@canvas/object";
import { nodeDraw, nodeInit, nodeTick } from "@objects/node";
import { Node, NodeOptions } from "@type/canvas";

export default defineObject<NodeOptions>({
    name: "Iron Gear Mold",
    description: "A mold for making iron gears.",
    inputs: [{
        material: "Watts",
        stored: 0
    },
    {
        material: "Iron",
        stored: 0
    }],
    outputs: [{
        material: "Iron Gears",
        stored: 0
    }],
    specs: [
        "5w + 2 Irons -> 3 Iron Gears",
        "Stores up to 12 iron gears"
    ],
    init: nodeInit,
    draw: nodeDraw,
    tick: self => {
        const node = self as Node;

        if (node.inputs[0].stored >= 5 && node.inputs[1].stored >= 2 && node.outputs[0].stored < 12) {
            node.inputs[0].stored -= 5;
            node.inputs[1].stored -= 2;
            node.outputs[0].stored += 3;
        }

        nodeTick(node);
    }
});
