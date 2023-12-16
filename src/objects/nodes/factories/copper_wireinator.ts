import { defineObject } from "@canvas/object";
import { nodeDraw, nodeInit, nodeTick } from "@objects/node";
import { Material, Node, NodeOptions } from "@type/canvas";

export default defineObject<NodeOptions>({
    name: "Copper Wire-inator",
    description: "A machine that turns copper into copper wire.",
    inputs: [{
        material: Material.Watts,
        stored: 0
    }, {
        material: Material.Copper,
        stored: 0
    }],
    outputs: [{
        material: Material.CopperWire,
        stored: 0
    }],
    specs: [
        "*50w* + *1 Copper* -> *8 Wire*",
        "Stores up to *128 copper wires*"
    ],
    type: "Factories",
    init: nodeInit,
    draw: nodeDraw,
    tick: self => {
        const node = self as Node;

        if (node.inputs[0].stored >= 50 && node.inputs[1].stored >= 1 && node.outputs[0].stored < 128) {
            node.inputs[0].stored -= 50;
            node.inputs[1].stored -= 1;
            node.outputs[0].stored += 8;
        }

        nodeTick(node);
    }
});
