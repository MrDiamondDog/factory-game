import { defineObject } from "@canvas/object";
import { nodeDraw, nodeInit, nodeTick } from "@objects/node";
import { Node, NodeOptions } from "@type/canvas";

export default defineObject<NodeOptions>({
    name: "Global Storage",
    description: "Send any item to global storage.",
    inputs: [{
        material: "Watts",
        stored: 0
    }, {
        material: "Any",
        stored: 0
    }],
    specs: [
        "1w -> Stores 25 items"
    ],
    init: nodeInit,
    draw: nodeDraw,
    tick: self => {
        const node = self as Node;

        if (node.inputs[0].stored >= 1 && node.inputs[1].stored >= 25) {
            node.inputs[0].stored -= 1;
            node.inputs[1].stored -= 25;
        }

        nodeTick(node);
    }
});
