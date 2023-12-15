import { Mouse } from "@canvas/input";
import { createObject } from "@canvas/object";
import { Node } from "@type/canvas";
import { weave } from "@util/array";
import { inside } from "@util/canvas";
import { query, queryElement } from "@util/dom";

export function nodeInit(self: Node) {
    const container = query<HTMLDivElement>("#factories");

    container.innerHTML += objectToHTML(self);
    container.innerHTML = container.innerHTML.replaceAll(",", "");

    const addButton = queryElement(container.lastElementChild as HTMLElement, "button");

    addButton.addEventListener("click", () => {
        const object = createObject<Node>(self.name);

        Mouse.listener.on("down", () => {
            if (!Mouse.leftDown || Mouse.dragging) return;

            if (inside(object.pos, object.size, Mouse.pos)) {
                Mouse.dragging = {
                    object,
                    offset: {
                        x: Mouse.pos.x - object.pos.x,
                        y: Mouse.pos.y - object.pos.y
                    }
                };
            }
        });

        Mouse.listener.on("move", () => {
            if (!Mouse.dragging || Mouse.dragging.object !== object) return;


        });
    });
}

export function objectToHTML(object: Node) {
    return `
    <div class="node">
        <h2>${object.name}</h2>
        <p>${object.description}</p>
        ${object.inputs || object.outputs ? `<table class="io">
            <tr>
                <th class="input">Inputs</th>
                <th class="output">Outputs</th>
            </tr>
            ${weave(object.inputs || [], object.outputs || []).map(val => `
            <tr>
                ${val[0] ? `<td class="input">${val[0]}</td>` : "<td></td>"}
                ${val[1] ? `<td class="output">${val[1]}</td>` : "<td></td>"}
            </tr>
            `)
}
        </table>` : ""}
        <button class="node-add">Add</button>
    </div>
    `;
}
