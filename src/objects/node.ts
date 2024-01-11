import { Camera } from "@canvas/camera";
import { ctxMenuOpen } from "@canvas/contextmenu";
import { Mouse } from "@canvas/input";
import { createObject, objects } from "@canvas/object";
import { money, onMoneyChange, setMoney } from "@economy/money";
import { Vec2 } from "@type/canvas";
import { CanvasNode, NodeOptions } from "@type/factory";
import { weave } from "@util/array";
import { drawCircle, inLine, inside, line, measureText } from "@util/canvas";
import { query, queryAll, queryElement } from "@util/dom";
import { roundTo } from "@util/math";

import { colors, ctx, transferSpeed } from "@/constants";

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

export function nodeDraw(self: CanvasNode) {
    const { pos, size } = self;

    // outline if mouse is hovering
    if ((!Mouse.hovering || Mouse.hovering === self) && inside(pos, size, Mouse.worldPos)) {
        ctx.fillStyle = colors.text;
        ctx.strokeStyle = colors.text;

        ctx.fillRect(pos.x - 3, pos.y - 3, size.x + 6, size.y + 6);

        Mouse.hovering = self;
    } else if (Mouse.hovering === self && !ctxMenuOpen) {
        Mouse.hovering = undefined;
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

    // draw line from io if dragging
    if (Mouse.dragging && Mouse.dragging.object === self && Mouse.dragging.io) {
        const ioPos = getIOPos(pos, size, Mouse.dragging.io.index, Mouse.dragging.io.type);

        ctx.strokeStyle = colors.ioPrimary;
        ctx.lineWidth = 3;

        line(ioPos, Mouse.worldPos);
    }

    // draw connections
    for (const connection of self.connections) {
        const from = getIOPos(connection.from.node.pos, connection.from.node.size, connection.from.index, connection.from.type);
        const to = getIOPos(connection.to.node.pos, connection.to.node.size, connection.to.index, connection.to.type);

        if ((!Mouse.hovering || Mouse.hovering === connection) && inLine(from, to, Mouse.worldPos)) {
            ctx.strokeStyle = colors.text;
            ctx.lineWidth = 7;
            line(from, to);

            Mouse.hovering = connection;
        } else if (Mouse.hovering === connection && !ctxMenuOpen) {
            Mouse.hovering = undefined;
        }

        ctx.strokeStyle = colors.ioPrimary;
        ctx.lineWidth = 3;

        line(from, to);
    }

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
}

export function nodeInit(self: NodeOptions) {
    if (!self.inputs) self.inputs = [];
    if (!self.outputs) self.outputs = [];

    container.appendChild(nodeToHTML(self));

    if (self.cost) {
        const buyButton = queryElement<HTMLButtonElement>(container, `#${self.name.replaceAll(" ", "_")} .node-buy`);

        function setDisabled() {
            buyButton.disabled = money < self.cost;
        }

        setDisabled();
        onMoneyChange.on("change", setDisabled);

        buyButton.addEventListener("click", () => {
            if (money < self.cost) return;
            setMoney(money - self.cost);

            queryAll<HTMLButtonElement>(".node-add").forEach(node => node.disabled = true);
            queryAll<HTMLButtonElement>(".node-buy").forEach(node => node.disabled = true);

            Mouse.listener.once("down", () => {
                createObject<CanvasNode>(self.name, Mouse.worldPos);

                queryAll<HTMLButtonElement>(".node-add").forEach(node => node.disabled = false);
                setMoney(money);
            });
        });

        return;
    }

    const addButton = queryElement(container, `#${self.name.replaceAll(" ", "_")} .node-add`);
    addButton.addEventListener("click", () => {
        queryAll<HTMLButtonElement>(".node-add").forEach(node => node.disabled = true);
        queryAll<HTMLButtonElement>(".node-buy").forEach(node => node.disabled = true);

        Mouse.listener.once("down", () => {
            createObject<CanvasNode>(self.name, Mouse.worldPos);

            queryAll<HTMLButtonElement>(".node-add").forEach(node => node.disabled = false);
            setMoney(money);
        });
    });
}

export function nodeTick(self: CanvasNode) {
    for (let i = 0; i < self.connections.length; i++) {
        const connection = self.connections[i];

        const fromConn = connection.from.node.outputs[connection.from.index];
        const toConn = connection.to.node.inputs[connection.to.index];

        if (fromConn.stored < transferSpeed) continue;
        fromConn.stored -= transferSpeed;
        toConn.stored += transferSpeed;

        fromConn.stored = roundTo(fromConn.stored, 2);
        toConn.stored = roundTo(toConn.stored, 2);
    }
}

export function nodeCreatedInit(self: CanvasNode) {
    self.size = {
        x: getWidth(self),
        y: getHeight(self)
    };
    self.connections = [];
    self.backConnections = [];

    Mouse.listener.on("down", () => {
        if (!Mouse.leftDown || Mouse.dragging) return;

        // io dragging
        for (let i = 0; i < self.inputs.length; i++) {
            const ioPos = getIOPos(self.pos, self.size, i, "input");

            if (Vec2.dist(ioPos, Mouse.worldPos) < 10) {
                Camera.lock();
                Mouse.dragging = {
                    object: self,
                    io: {
                        type: "input",
                        index: i,
                        val: self.inputs[i]
                    }
                };
                return;
            }
        }

        for (let i = 0; i < self.outputs.length; i++) {
            const ioPos = getIOPos(self.pos, self.size, i, "output");

            if (Vec2.dist(ioPos, Mouse.worldPos) < 10) {
                Camera.lock();
                Mouse.dragging = {
                    object: self,
                    io: {
                        type: "output",
                        index: i,
                        val: self.outputs[i]
                    }
                };
                return;
            }
        }

        // node dragging
        if (inside(self.pos, self.size, Mouse.worldPos)) {
            Camera.lock();
            Mouse.dragging = {
                object: self,
                offset: {
                    x: Mouse.worldPos.x - self.pos.x,
                    y: Mouse.worldPos.y - self.pos.y
                }
            };
        }
    });

    Mouse.listener.on("move", () => {
        if (!Mouse.dragging || Mouse.dragging.object !== self || !Mouse.dragging.offset) return;

        self.pos = Vec2.sub(Mouse.worldPos, Mouse.dragging.offset);
    });

    Mouse.listener.on("up", () => {
        if (!Mouse.dragging || Mouse.dragging.object !== self) return;

        if (Mouse.dragging.io) {
            for (const obj of objects) {
                if (!(obj as CanvasNode).inputs) continue;

                const node = obj as CanvasNode;

                if (Mouse.dragging.io.type !== "input") {
                    for (let i = 0; i < node.inputs.length; i++) {
                        const ioPos = getIOPos(node.pos, node.size, i, "input");

                        if (Vec2.dist(ioPos, Mouse.worldPos) < 10) {
                            // convert any to the material of the input
                            if (node.inputs[i].material === "Any")
                                node.inputs[i].material = Mouse.dragging.io.val.material;

                            // make sure they have the same value
                            if (Mouse.dragging.io.val.material !== node.inputs[i].material) continue;

                            const fromNode = Mouse.dragging.object as CanvasNode;

                            fromNode.connections.push({
                                from: {
                                    node: fromNode,
                                    type: Mouse.dragging.io.type,
                                    index: Mouse.dragging.io.index
                                },
                                to: {
                                    node,
                                    type: "input",
                                    index: i
                                }
                            });

                            node.backConnections.push({
                                from: {
                                    node: fromNode,
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
                        if (Mouse.dragging.io.val.material === "Any")
                            Mouse.dragging.io.val.material = node.outputs[i].material;

                        // make sure they have the same value
                        if (Mouse.dragging.io.val.material !== node.outputs[i].material) continue;

                        const fromNode = Mouse.dragging.object as CanvasNode;

                        node.connections.push({
                            from: {
                                node,
                                type: "output",
                                index: i
                            },
                            to: {
                                node: fromNode,
                                type: Mouse.dragging.io.type,
                                index: Mouse.dragging.io.index
                            }
                        });

                        fromNode.backConnections.push({
                            from: {
                                node,
                                type: "output",
                                index: i
                            },
                            to: {
                                node: fromNode,
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
        ${node.cost ? `<button class="node-buy">Buy ($${node.cost})</button>` : "<button class=\"node-add\">Add</button>"}
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
