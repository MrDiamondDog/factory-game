import { defineObject } from "@canvas/object";
import { tps } from "@canvas/renderer";
import { nodeDraw, nodeInit, nodeTick } from "@objects/node";
import { Material, Node, NodeOptions } from "@type/canvas";

export default defineObject<NodeOptions>({
    name: "Water Pump",
    description: "A basic pump to pull from water sources.",
    inputs: [{
        material: Material.Watts,
        stored: 0
    }],
    outputs: [{
        material: Material.Water,
        stored: 0
    }],
    specs: [
        "*10w* + *15s* -> *5 Water*",
        "Stores up to *100 water*"
    ],
    type: "Gathering",
    init: nodeInit,
    draw: nodeDraw,
    vars: {
        cooldown: 0
    },
    tick: self => {
        const node = self as Node;

        if (node.outputs[0].stored >= 100) return;
        if (node.vars.cooldown <= 0 && node.inputs[0].stored >= 10) {
            node.outputs[0].stored += 5;
            node.inputs[0].stored -= 10;

            node.vars.cooldown = 15 * tps;
        }
        node.vars.cooldown--;

        nodeTick(node);
    }
});
