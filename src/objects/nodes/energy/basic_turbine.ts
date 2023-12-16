import { defineObject } from "@canvas/object";
import { tps } from "@canvas/renderer";
import { nodeDraw, nodeInit, nodeTick } from "@objects/node";
import { Material, Node, NodeOptions } from "@type/canvas";

export default defineObject<NodeOptions>({
    name: "Basic Turbine",
    description: "A basic turbine that can generate larger amounts of power, but slowly.",
    inputs: [{
        material: Material.Watts,
        stored: 0
    }, {
        material: Material.Water,
        stored: 0
    }],
    outputs: [{
        material: Material.Watts,
        stored: 0
    }],
    type: "Energy",
    init: nodeInit,
    draw: nodeDraw,
    vars: {
        cooldown: 0
    },
    specs: [
        "*10w* + *5 Water* + *15s* -> *50w*",
        "Stores up to *500w*"
    ],
    tick: self => {
        const node = self as Node;

        if (node.outputs[0].stored >= 500) return;
        if (node.vars.cooldown <= 0 && node.inputs[0].stored >= 10 && node.inputs[1].stored >= 5) {
            node.outputs[0].stored += 50;
            node.outputs[0].stored = Math.round(node.outputs[0].stored * 100) / 100;
            node.inputs[0].stored -= 10;
            node.inputs[1].stored -= 5;

            node.vars.cooldown = 15 * tps;
        }
        node.vars.cooldown--;

        nodeTick(self as Node);
    }
});
