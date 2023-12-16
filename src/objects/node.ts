import { Camera } from "@canvas/camera";
import { Mouse } from "@canvas/input";
import { createObject, objects } from "@canvas/object";
import { Material, Node, NodeOptions, Vec2 } from "@type/canvas";
import { weave } from "@util/array";
import { drawCircle, inside, line, measureText } from "@util/canvas";
import { query, queryAll, queryElement } from "@util/dom";
import { Log } from "@util/logger";
import { roundTo } from "@util/math";

import { colors, ctx } from "@/constants";
const container = query<HTMLDivElement>("#factories");

export function getWidth(options: NodeOptions): number {
    let longest = {
        str: "",
        isIO: false
    };

    for (const io of options.inputs.concat(options.outputs)) {
        if (io.material.length > longest.str.length) {
            longest = {
                str: io.material,
                isIO: true
            };
        }
    }
    if (options.name.length > longest.str.length) {
        longest = {
            str: options.name,
            isIO: false
        };
    }

    if (longest.isIO) ctx.font = "15px roboto mono";
    else ctx.font = "25px roboto mono";

    Log("width", measureText(longest.str).x + 50);

    return measureText(longest.str).x + 50;
}

export function getHeight(options: NodeOptions): number {
    return Math.max(options.inputs.length, options.outputs.length) * 25 + 75;
}

export function getIOPos(pos: Vec2, size: Vec2, i: number, inputOutput: "input" | "output") {
    return {
        x: pos.x + (inputOutput === "input" ? 0 : size.x),
        y: pos.y + 47 + i * 25
    };
}

export function nodeDraw(self: Node) {
    const { pos, size } = self;

    // outline if mouse is hovering
    if (inside(pos, size, Mouse.worldPos)) {
        ctx.fillStyle = colors.text;
        ctx.strokeStyle = colors.text;

        ctx.fillRect(pos.x - 3, pos.y - 3, size.x + 6, size.y + 6);
    }

    ctx.fillStyle = colors.backgroundSecondary;
    ctx.strokeStyle = colors.backgroundSecondary;

    // Actual box
    ctx.fillRect(pos.x, pos.y, size.x, size.y);

    // title
    ctx.fillStyle = colors.text;
    ctx.strokeStyle = colors.text;

    ctx.font = "25px roboto mono";
    ctx.fillText(self.name, pos.x + 10, pos.y + 10);

    // ios
    ctx.font = "15px roboto mono";
    for (let i = 0; i < self.inputs.length; i++) {
        const ioPos = getIOPos(pos, size, i, "input");

        // draw outline
        if (Vec2.dist(ioPos, Mouse.worldPos) < 10) {
            ctx.fillStyle = colors.text;
            ctx.strokeStyle = colors.text;
            drawCircle(ioPos, 7);
        }

        ctx.fillStyle = colors.text;
        ctx.strokeStyle = colors.text;

        ctx.fillText(self.inputs[i].material, ioPos.x + 10, ioPos.y - 7);

        ctx.fillStyle = colors.textSecondary;
        ctx.strokeStyle = colors.textSecondary;

        ctx.fillText(`(${self.inputs[i].stored})`, ioPos.x + 10 + measureText(self.inputs[i].material).x, ioPos.y - 7);

        ctx.fillStyle = colors.ioPrimary;
        ctx.strokeStyle = colors.ioPrimary;

        drawCircle(ioPos, 5);
    }

    ctx.textAlign = "right";
    for (let i = 0; i < self.outputs.length; i++) {
        const ioPos = getIOPos(pos, size, i, "output");

        // draw outline
        if (Vec2.dist(ioPos, Mouse.worldPos) < 10) {
            ctx.fillStyle = colors.text;
            ctx.strokeStyle = colors.text;
            drawCircle(ioPos, 7);
        }

        ctx.fillStyle = colors.text;
        ctx.strokeStyle = colors.text;

        ctx.fillText(self.outputs[i].material, ioPos.x - 12 - measureText(self.outputs[i].stored + "()").x, ioPos.y - 7);

        ctx.fillStyle = colors.textSecondary;
        ctx.strokeStyle = colors.textSecondary;

        ctx.fillText(`(${self.outputs[i].stored})`, ioPos.x - 8, ioPos.y - 7);

        ctx.fillStyle = colors.ioPrimary;
        ctx.strokeStyle = colors.ioPrimary;

        drawCircle(ioPos, 5);
    }
    ctx.textAlign = "left";

    // draw line from io if dragging
    if (Mouse.dragging && Mouse.dragging.object === self && Mouse.dragging.io) {
        const ioPos = getIOPos(pos, size, Mouse.dragging.io.index, Mouse.dragging.io.type);

        ctx.strokeStyle = colors.ioPrimary;
        ctx.lineWidth = 3;

        line(ioPos, Mouse.worldPos);
    }

    // draw connections
    ctx.strokeStyle = colors.ioPrimary;
    ctx.lineWidth = 3;

    for (const connection of self.connections) {
        const from = getIOPos(connection.from.node.pos, connection.from.node.size, connection.from.index, connection.from.type);
        const to = getIOPos(connection.to.node.pos, connection.to.node.size, connection.to.index, connection.to.type);

        line(from, to);
    }
}

export function createNode(self: NodeOptions) {
    const object = createObject<Node>(self.name, Mouse.worldPos);
    object.size = {
        x: getWidth(self),
        y: getHeight(self)
    };
    object.connections = [];

    Mouse.listener.on("down", () => {
        if (!Mouse.leftDown || Mouse.dragging) return;

        // io dragging
        for (let i = 0; i < object.inputs.length; i++) {
            const ioPos = getIOPos(object.pos, object.size, i, "input");

            if (Vec2.dist(ioPos, Mouse.worldPos) < 10) {
                Camera.lock();
                Mouse.dragging = {
                    object,
                    io: {
                        type: "input",
                        index: i,
                        val: object.inputs[i]
                    }
                };
                return;
            }
        }

        for (let i = 0; i < object.outputs.length; i++) {
            const ioPos = getIOPos(object.pos, object.size, i, "output");

            if (Vec2.dist(ioPos, Mouse.worldPos) < 10) {
                Camera.lock();
                Mouse.dragging = {
                    object,
                    io: {
                        type: "output",
                        index: i,
                        val: object.outputs[i]
                    }
                };
                return;
            }
        }

        // node dragging
        if (inside(object.pos, object.size, Mouse.worldPos)) {
            Camera.lock();
            Mouse.dragging = {
                object,
                offset: {
                    x: Mouse.worldPos.x - object.pos.x,
                    y: Mouse.worldPos.y - object.pos.y
                }
            };
        }
    });

    Mouse.listener.on("move", () => {
        if (!Mouse.dragging || Mouse.dragging.object !== object || !Mouse.dragging.offset) return;

        object.pos = Vec2.sub(Mouse.worldPos, Mouse.dragging.offset);
    });

    Mouse.listener.on("up", () => {
        if (!Mouse.dragging || Mouse.dragging.object !== object) return;

        if (Mouse.dragging.io) {
            for (const obj of objects) {
                if (!(obj as Node).inputs) continue;

                const node = obj as Node;

                if (Mouse.dragging.io.type !== "input") {
                    for (let i = 0; i < node.inputs.length; i++) {
                        const ioPos = getIOPos(node.pos, node.size, i, "input");

                        if (Vec2.dist(ioPos, Mouse.worldPos) < 10) {
                            // convert any to the material of the input
                            if (node.inputs[i].material === Material.Any && Mouse.dragging.io.val.material !== Material.Watts)
                                node.inputs[i].material = Mouse.dragging.io.val.material;

                            // make sure they have the same value
                            if (Mouse.dragging.io.val.material !== node.inputs[i].material) continue;
                            Mouse.dragging.object.connections.push({
                                from: {
                                    node: Mouse.dragging.object,
                                    type: Mouse.dragging.io.type,
                                    index: Mouse.dragging.io.index
                                },
                                to: {
                                    node,
                                    type: "input",
                                    index: i
                                }
                            });
                        }
                    }
                }

                if (Mouse.dragging.io.type === "output") continue;
                for (let i = 0; i < node.outputs.length; i++) {
                    const ioPos = getIOPos(node.pos, node.size, i, "output");

                    if (Vec2.dist(ioPos, Mouse.worldPos) < 10) {
                        // convert any to the material of the input
                        if (Mouse.dragging.io.val.material === Material.Any && node.outputs[i].material !== Material.Watts)
                            Mouse.dragging.io.val.material = node.outputs[i].material;

                        // make sure they have the same value
                        if (Mouse.dragging.io.val.material !== node.outputs[i].material) continue;
                        node.connections.push({
                            from: {
                                node,
                                type: "output",
                                index: i
                            },
                            to: {
                                node: Mouse.dragging.object,
                                type: Mouse.dragging.io.type,
                                index: Mouse.dragging.io.index
                            }
                        });
                    }
                }
            }
        }

        Mouse.dragging = undefined;
        Camera.unlock();
    });
}

export function nodeInit(self: NodeOptions) {
    if (!self.inputs) self.inputs = [];
    if (!self.outputs) self.outputs = [];

    container.appendChild(nodeToHTML(self));

    const addButton = queryElement(container, `#${self.name.replaceAll(" ", "_")} button`);

    const size = {
        x: getWidth(self),
        y: getHeight(self)
    };

    const preview = () => {
        ctx.fillStyle = colors.backgroundSecondary;
        ctx.strokeStyle = colors.backgroundSecondary;

        ctx.fillRect(Mouse.worldPos.x, Mouse.worldPos.y, size.x, size.y);
    };

    addButton.addEventListener("click", () => {
        Mouse.listener.on("move", preview);

        Mouse.listener.once("down", () => {
            createNode(self);
            Mouse.listener.off("move", preview);
        });
    });
}

export function nodeTick(self: Node) {
    for (let i = 0; i < self.connections.length; i++) {
        const connection = self.connections[i];
        const speed = 1;

        const fromConn = connection.from.node.outputs[connection.from.index];
        const toConn = connection.to.node.inputs[connection.to.index];

        if (fromConn.stored < speed) continue;
        fromConn.stored -= speed;
        toConn.stored += speed;

        fromConn.stored = roundTo(fromConn.stored, 2);
        toConn.stored = roundTo(toConn.stored, 2);
    }
}

export function nodeToHTML(node: NodeOptions) {
    const div = document.createElement("div");
    div.classList.add("node");
    div.id = node.name.replaceAll(" ", "_");
    div.dataset.type = node.type;
    div.innerHTML += `
        <h2>${node.name}</h2>
        <p class="footer">${node.type}</p>
        <p>${node.description}</p>
        ${node.specs ?
        `<h3>Specs</h3>
        <ul>
            ${node.specs ? node.specs.map(spec => `<li>${spec.replaceAll(/\*(.*?)\*/g, "<strong>$1</strong>").replaceAll("->", "→")}</li>`).join("") : ""}
        </ul>`
        : ""}
        ${node.inputs.length > 0 || node.outputs.length > 0 ? `<table class="io"><tbody>
            <tr>
                <th class="input">Inputs</th>
                <th class="output">Outputs</th>
            </tr>
            ${weave(node.inputs || [], node.outputs || []).map(val => `
            <tr>
                ${val[0] ? `<td class="input">${val[0].material}</td>` : "<td></td>"}
                ${val[1] ? `<td class="output">${val[1].material}</td>` : "<td></td>"}
            </tr>`).join("")}
        </tbody></table>` : ""}
        <button class="node-add">Add</button>
    `;
    return div;
}

query("#node-search").addEventListener("input", () => {
    const search = query<HTMLInputElement>("#node-search").value.toLowerCase();

    const nodes = queryAll(".node");

    for (const node of nodes) {
        if (search.startsWith("#")) {
            if (!node.dataset.type.toLowerCase().includes(search.replace("#", "").toLowerCase())) node.style.display = "none";
            else node.style.display = "block";
        } else {
            if (node.id.toLowerCase().replace("_", " ").includes(search.toLowerCase())) node.style.display = "block";
            else node.style.display = "none";
        }
    }
});
