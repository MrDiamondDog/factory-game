import { ObjectOptions, Object, Vec2 } from "@type/canvas";
import { weave } from "@util/array";
import { query, queryElement } from "@util/dom";
import { objects } from "./renderer";
import { Camera } from "./camera";
import { clone } from "@util/object";
import { Mouse } from "./input";
import { Log } from "@util/logger";
import { colliding, drawCircle, inside, line, measureText, worldToScreen } from "@util/canvas";
import { colors, ctx } from "@/constants";

export function getWidth(options: ObjectOptions): number {
    let longest = {
        str: "",
        isIO: false
    };

    for (const io of options.inputs.concat(options.outputs)) {
        if (io.length > longest.str.length) {
            longest = {
                str: io,
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

    return measureText(longest.str).x * 1.5;
}

export function getHeight(options: ObjectOptions): number {
    return 100 + Math.max(options.inputs.length, options.outputs.length) * 25;
}

export function getIOPos(pos: Vec2, size: Vec2, i: number, inputOutput: "input" | "output") {
    return {
        x: pos.x + (inputOutput == "input" ? 0 : size.x),
        y: pos.y + 47 + i * 25
    };
}

export function drawNode(self: Object) {
    const pos = worldToScreen(self.pos);

    ctx.fillStyle = colors.backgroundSecondary;
    ctx.fillRect(pos.x, pos.y, self.size.x, self.size.y);

    ctx.font = "25px roboto mono";
    ctx.fillStyle = "#fff";
    ctx.fillText(self.name, pos.x + 10, pos.y + 10);

    ctx.font = "15px roboto mono";

    for (let i = 0; i < self.inputs.length; i++) {
        const inputPos = getIOPos(pos, self.size, i, "input");

        ctx.fillStyle = colors.ioPrimary;
        drawCircle(inputPos, 5);

        ctx.fillStyle = "#fff";
        ctx.fillText(self.inputs[i], inputPos.x + 10, inputPos.y - 7);
    }

    for (let i = 0; i < self.outputs.length; i++) {
        const outputPos = getIOPos(pos, self.size, i, "output");

        ctx.fillStyle = colors.ioPrimary;
        drawCircle(outputPos, 5);

        ctx.textAlign = "right";
        ctx.fillStyle = "#fff";
        ctx.fillText(self.outputs[i], outputPos.x - 10, outputPos.y - 7);
        ctx.textAlign = "left";
    }

    if (!Mouse.dragging || Mouse.dragging.object != self) return;
    if (!(Mouse.dragging.input || Mouse.dragging.output)) return;

    const ioPos = getIOPos(pos,
        self.size,
        Mouse.dragging.input ? self.inputs.indexOf(Mouse.dragging.input) : self.outputs.indexOf(Mouse.dragging.output),
        Mouse.dragging.input ? "input" : "output"
    );

    ctx.strokeStyle = colors.ioPrimary;
    ctx.lineWidth = 2;
    line(ioPos, Mouse.pos);
}

export function defineNode(options: ObjectOptions) {
    if (options.hidden) return options;

    const container = query<HTMLDivElement>("#factories");
    container.innerHTML += objectToHTML(options);

    queryElement<HTMLButtonElement>(container, "button").addEventListener("click", e => {
        const object: Object = {
            ...options,
            pos: clone(Camera.pos),
            size: { x: getWidth(options), y: getHeight(options) },
        };

        objects.push(object);

        Mouse.listener.on("down", (e: MouseEvent) => {
            if (!Mouse.leftDown || Mouse.dragging) return;

            for (let i = 0; i < object.inputs.length; i++) {
                if (Vec2.dist(Mouse.worldPos, { x: object.pos.x, y: object.pos.y + 47 + i * 25 }) < 10) {
                    Log("input", object.inputs[i]);
                    Camera.lock();
                    Mouse.dragging = { object, input: object.inputs[i] };
                    return;
                }
            }

            for (let i = 0; i < object.outputs.length; i++) {
                if (Vec2.dist(Mouse.worldPos, { x: object.pos.x + getWidth(object), y: object.pos.y + 47 + i * 25 }) < 10) {
                    Log("output", object.outputs[i]);
                    Camera.lock();
                    Mouse.dragging = { object, output: object.outputs[i] };
                    return;
                }
            }

            if (inside(object.pos, object.size, Mouse.worldPos)) {
                Log("node", object.name);
                Camera.lock();
                Mouse.dragging = { object, offset: Vec2.sub(Mouse.worldPos, object.pos) };
            }
        });

        Mouse.listener.on("move", (e: MouseEvent) => {
            if (!Mouse.dragging) return;
            if (!Mouse.leftDown || Mouse.dragging.object != object) return;

            if (Mouse.dragging.input || Mouse.dragging.output) return;

            object.pos = Vec2.sub(Mouse.worldPos, Mouse.dragging.offset);
        });

        Mouse.listener.on("up", (e: MouseEvent) => {
            if (!Mouse.dragging) return;
            if (Mouse.dragging.object != object) return;

            Camera.unlock();
            Mouse.dragging = undefined;
        });

        if (options.init) options.init();
    });

    return options;
}

export function objectToHTML(object: ObjectOptions) {
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
        </table>` : ''}
        <button class="node-add">Add</button>
    </div>
    `;
}