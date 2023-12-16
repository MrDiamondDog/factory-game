import { defineObject } from "@canvas/object";
import { nodeDraw, nodeInit, nodeTick } from "@objects/node";
import { addToStorage } from "@storage/global";
import { Material, Node, NodeOptions } from "@type/canvas";

export default defineObject<NodeOptions>({
    name: "Global Storage",
    description: "Send any item to global storage.",
    inputs: [{
        material: Material.Watts,
        stored: 0
    }, {
        material: Material.Any,
        stored: 0
    }],
    specs: [
        "*1w* -> Stores *1 item*"
    ],
    type: "Other",
    init: nodeInit,
    draw: nodeDraw,
    tick: self => {
        const node = self as Node;

        if (node.inputs[0].stored >= 1 && node.inputs[1].stored >= 1) {
            node.inputs[0].stored -= 1;
            node.inputs[1].stored -= 1;

            // add to global storage
            addToStorage(node.inputs[1].material, 1);
        }

        nodeTick(node);
    }
});
