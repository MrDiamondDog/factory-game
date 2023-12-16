import { defineObject } from "@canvas/object";
import { nodeDraw, nodeInit, nodeTick } from "@objects/node";
import { Material, Node, NodeOptions } from "@type/canvas";

export default defineObject<NodeOptions>({
    name: "Circuit Builder",
    description: "An advanced machine that builds circuits.",
    inputs: [{
        material: Material.Watts,
        stored: 0
    }, {
        material: Material.Copper,
        stored: 0
    }, {
        material: Material.Iron,
        stored: 0
    }, {
        material: Material.CopperWire,
        stored: 0
    }],
    outputs: [{
        material: Material.Circuit,
        stored: 0
    }],
    specs: [
        "*50w* + *5 Copper* + *5 Iron* + *8 Copper Wire* -> *2 Circuits*",
        "Stores up to *50 circuits*"
    ],
    type: "Factories",
    init: nodeInit,
    draw: nodeDraw,
    tick: self => {
        const node = self as Node;

        if (node.inputs[0].stored >= 50 && node.inputs[1].stored >= 5 && node.inputs[2].stored >= 5 && node.inputs[3].stored >= 8) {
            node.inputs[0].stored -= 50;
            node.inputs[1].stored -= 5;
            node.inputs[2].stored -= 5;
            node.inputs[3].stored -= 8;

            node.outputs[0].stored += 2;
        }

        nodeTick(node);
    }
});
