import { defineObject } from "@canvas/object";
import { nodeDraw, nodeInit, nodeTick } from "@objects/node";
import { Node, NodeOptions } from "@type/canvas";

export default defineObject<NodeOptions>({
    name: "Iron Drill",
    description: "A simple drill to extract iron. It's not very efficient, but it's cheap.",
    inputs: [{
        material: "Watts",
        stored: 0
    }],
    outputs: [{
        material: "Iron",
        stored: 0
    }],
    specs: [
        "10w -> 1 Iron",
        "Stores up to 100 iron"
    ],
    init: nodeInit,
    draw: nodeDraw,
    tick: self => {
        const node = self as Node;

        if (node.inputs[0].stored >= 10 && node.outputs[0].stored < 100) {
            node.inputs[0].stored -= 10;
            node.outputs[0].stored++;
        }

        nodeTick(node);
    }
});
