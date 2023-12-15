import { defineObject } from "@canvas/object";
import { nodeInit } from "@objects/node";
import { NodeOptions } from "@type/canvas";

import { ctx } from "@/constants";

export default defineObject<NodeOptions>({
    name: "Node",
    description: "A node",
    inputs: ["test1", "test2"],
    outputs: ["yippie"],
    draw: self => {
        ctx.fillStyle = "#fff";
        ctx.fillRect(self.pos.x, self.pos.y, 100, 100);
    },
    init: nodeInit
});
