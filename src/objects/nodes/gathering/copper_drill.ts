import { defineObject } from "@canvas/object";
import { nodeDraw, nodeInit, nodeTick } from "@objects/node";
import { Material, Node, NodeOptions } from "@type/canvas";

export default defineObject<NodeOptions>({
    name: "Copper Drill",
    description: "A more advanced drill used to mine copper.",
    inputs: [{
        material: Material.Watts,
        stored: 0
    }],
    outputs: [{
        material: Material.Copper,
        stored: 0
    }],
    specs: [
        "*10w* -> *2 Copper*",
        "Stores up to *100 copper*"
    ],
    type: "Gathering",
    init: nodeInit,
    draw: nodeDraw,
    tick: self => {
        const node = self as Node;

        if (node.inputs[0].stored >= 10 && node.outputs[0].stored < 100) {
            node.inputs[0].stored -= 10;
            node.outputs[0].stored += 2;
        }

        nodeTick(node);
    }
});
