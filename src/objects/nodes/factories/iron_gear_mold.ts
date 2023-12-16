import { defineObject } from "@canvas/object";
import { nodeDraw, nodeInit, nodeTick } from "@objects/node";
import { Material, Node, NodeOptions } from "@type/canvas";

export default defineObject<NodeOptions>({
    name: "Iron Gear Mold",
    description: "A mold for making iron gears.",
    inputs: [{
        material: Material.Watts,
        stored: 0
    },
    {
        material: Material.Iron,
        stored: 0
    }],
    outputs: [{
        material: Material.IronGear,
        stored: 0
    }],
    specs: [
        "*5w* + *2 Iron* -> *3 Iron Gears*",
        "Stores up to *12 iron gears*"
    ],
    type: "Factories",
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
