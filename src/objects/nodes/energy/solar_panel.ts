import { defineObject } from "@canvas/object";
import { nodeDraw, nodeInit, nodeTick } from "@objects/node";
import { Material, Node, NodeOptions } from "@type/canvas";

export default defineObject<NodeOptions>({
    name: "Solar Panel",
    description: "A crude solar panel that might generate enough power to run a drill or two.",
    outputs: [{
        material: Material.Watts,
        stored: 0
    }],
    type: "Energy",
    vars: {
        cooldown: 0
    },
    specs: [
        "*0.1w* / *10 ticks*",
        "Stores up to *100w*"
    ],
    init: nodeInit,
    draw: nodeDraw,
    tick: self => {
        const node = self as Node;

        if (node.outputs[0].stored >= 100) return;
        if (node.vars.cooldown <= 0) {
            node.outputs[0].stored += 0.1;
            node.outputs[0].stored = Math.round(node.outputs[0].stored * 100) / 100;
            node.vars.cooldown = 10;
        }
        node.vars.cooldown--;

        nodeTick(self as Node);
    }
});
