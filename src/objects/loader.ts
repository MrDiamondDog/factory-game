import { createObject, defineObject, objects } from "@canvas/object";
import { FPS, setDebug } from "@canvas/renderer";
import { money, setMoney } from "@economy/money";
import { addToStorage, clearStorage, setStorage, storage } from "@economy/storage";
import { CanvasNode, ExportedData, ExportedFactory, FactoryDefinition, FakeMaterials, MaterialPrices, NodeOptions } from "@type/factory";
import { downloadFile, query } from "@util/dom";
import { Log, transFlag } from "@util/logger";
import { roundTo } from "@util/math";

import { version } from "@/constants";

import { nodeCreatedInit, nodeDraw, nodeInit, nodeTick } from "./node";

export const listPath = "machines/list.json";

export async function loadMachines() {
    const list = await fetch(listPath).then(r => r.json()) as string[];

    const machines: FactoryDefinition[] = [];
    for (const file of list) {
        const machine = await fetch(`machines/${file}`).then(r => r.json()) as FactoryDefinition;
        machines.push(machine);
    }

    machines.sort((a, b) => a.cost - b.cost);

    const unknownMaterials: string[] = [];

    for (const machine of machines) {
        Log("loader", `Loading machine ${machine.name}`);

        machine.produces?.forEach(produce => {
            if (!produce.time) return;
            if (!produce.time.seconds && !produce.time.ticks) throw new Error(`One of seconds or ticks must be defined for ${machine.name}`);
            if (produce.time.seconds && produce.time.ticks) throw new Error(`Only one of seconds or ticks must be defined for ${machine.name}`);
        });

        machine.inputs?.forEach(input => {
            if (FakeMaterials.includes(input)) return;
            if (!Object.keys(MaterialPrices).includes(input) && !unknownMaterials.includes(input)) {
                unknownMaterials.push(input);
            }
        });

        machine.outputs?.forEach(output => {
            if (FakeMaterials.includes(output)) return;
            if (!Object.keys(MaterialPrices).includes(output) && !unknownMaterials.includes(output)) {
                unknownMaterials.push(output);
            }
        });

        defineObject<NodeOptions>({
            name: machine.name,
            description: machine.description,
            type: machine.type,
            inputs: machine.inputs?.map(input => ({ stored: 0, material: input, any: input === "Any" })),
            outputs: machine.outputs?.map(output => ({ stored: 0, material: output })),
            specs: machine.specs,
            cost: machine.cost,
            draw: nodeDraw,
            init: nodeInit,
            createdInit: nodeCreatedInit,
            vars: {
                cooldowns: Object.fromEntries(
                    machine.produces?.filter(produce => produce.time).map(produce => [produce.materials, 0])
                    || []
                )
            },
            tick: self => {
                const node = self as CanvasNode;

                if (machine.name === "Global Storage") {
                    if (node.inputs[0].stored >= 1 && node.inputs[1].stored >= 1) {
                        node.inputs[0].stored--;
                        node.inputs[1].stored--;

                        addToStorage(node.inputs[1].material, 1);
                    }

                    return;
                }

                if (machine.name === "Market") {
                    if (node.inputs[1].material === "Any") return;

                    if (node.inputs[0].stored >= 5 && node.inputs[1].stored >= 1) {
                        node.inputs[0].stored -= 5;
                        node.inputs[1].stored--;

                        const { material } = node.inputs[0];
                        const price = MaterialPrices[material];
                        if (!price) throw new Error(`No price for material ${material}`);

                        setMoney(money + price);
                    }

                    return;
                }

                if (!machine.produces) return;
                outer:
                for (const produce of machine.produces) {
                    const mat = produce.materials[0];
                    // handle cooldown if applicable
                    if (produce.time) {
                        const cooldown = node.vars.cooldowns[mat.material];
                        if (cooldown > 0) {
                            node.vars.cooldowns[mat.material]--;
                            continue;
                        }
                    }
                    node.vars.cooldowns[mat.material] =
                        produce.time ? produce.time.seconds ? produce.time.seconds * FPS : produce.time.ticks : 0;

                    // check if output is full
                    for (const material of produce.materials) {
                        const output = node.outputs.find(output => output.material === material.material)!;
                        if (output.stored >= material.limit) continue outer;
                    }

                    // check inputs for required items
                    if (produce.requires) {
                        const hasRequired = produce.requires.every(required => {
                            const input = node.inputs.find(input => input.material === required.material);
                            if (!input) return false;
                            return input.stored >= required.amount;
                        });
                        if (!hasRequired) continue;
                    }

                    // remove required items
                    if (produce.requires) {
                        for (const required of produce.requires) {
                            const input = node.inputs.find(input => input.material === required.material)!;
                            input.stored -= required.amount;

                            input.stored = roundTo(input.stored, 2);
                        }
                    }

                    // add items
                    for (const material of produce.materials) {
                        const output = node.outputs.find(output => output.material === material.material)!;
                        output.stored += material.amount;

                        output.stored = roundTo(output.stored, 2);
                    }
                }

                nodeTick(node);
            },
        });
    }

    if (unknownMaterials.length > 0) {
        Log("loader", `Unknown materials: ${unknownMaterials.join(", ")}`);
    }
}

export function save() {
    const exports = objects.map(obj => {
        const node = obj as CanvasNode;
        const { name, pos, connections, id, inputs, outputs } = node;

        const exportedConnections = connections.map(connection => {
            const { from, to } = connection;
            const { node: fromNode, type: fromType, index: fromIndex } = from;
            const { node: toNode, type: toType, index: toIndex } = to;

            const fromId = fromNode.id;
            const toId = toNode.id;

            return {
                from: { id: fromId, type: fromType, index: fromIndex },
                to: { id: toId, type: toType, index: toIndex }
            };
        });

        const definition = { name, pos, connections: exportedConnections, id, inputs, outputs } as ExportedFactory;

        return definition;
    });

    const out = {
        objects: exports,
        storage,
        money,
        version
    };

    const json = JSON.stringify(out);
    const b64 = btoa(json);

    window.localStorage.setItem("save", b64);
    window.localStorage.setItem("last-version", version);
}

export function load(data: ExportedData) {
    objects.length = 0;
    clearStorage();

    const { objects: nodes, storage, DEBUG: isDebug, TRANS } = data;

    // load nodes
    for (const node of nodes) {
        const { name, pos, id } = node;

        const nodeInstance = createObject<CanvasNode>(name, pos);
        nodeInstance.id = id;
    }

    for (const node of nodes) {
        const { connections } = node;

        const nodeInstance = objects.find(obj => obj.id === node.id) as CanvasNode;

        // load ios
        if (node.inputs) {
            for (const input of node.inputs) {
                const { material, stored } = input;
                nodeInstance.inputs.find(input => input.material === material || input.material === "Any")!.stored = stored;
            }
        }

        if (node.outputs) {
            for (const output of node.outputs) {
                const { material, stored } = output;
                nodeInstance.outputs.find(output => output.material === material)!.stored = stored;
            }
        }

        // load connections
        for (const connection of connections) {
            const { from, to } = connection;

            const fromNode = objects.find(obj => obj.id === from.id) as CanvasNode;
            const toNode = objects.find(obj => obj.id === to.id) as CanvasNode;

            const fromData = { node: fromNode, type: from.type, index: from.index };
            const toData = { node: toNode, type: to.type, index: to.index };

            // check for any
            if (toData.type === "input" && toNode.inputs[toData.index].any) {
                const { material } = fromNode.outputs[fromData.index];
                toNode.inputs[toData.index].material = material;
            }

            nodeInstance.connections.push({ from: fromData, to: toData });
            toData.node.backConnections.push({ from: fromData, to: toData });
        }
    }

    // load storage
    setStorage(storage);
    setMoney(data.money);

    // load secrets
    if (isDebug) setDebug(isDebug);
    if (TRANS) {
        transFlag();
    }
}

query("#save").addEventListener("click", save);
export const loadButton = query("#load");
loadButton.addEventListener("click", () => {
    const b64 = window.localStorage.getItem("save");
    if (!b64) return;

    const json = atob(b64);
    const data = JSON.parse(json) as ExportedData;

    load(data);
});

query("#export").addEventListener("click", () => {
    save();

    const b64 = window.localStorage.getItem("save");
    if (!b64) return;

    downloadFile("factory.fsave", b64);
});

query("#import").addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".fsave";
    input.addEventListener("change", () => {
        const file = input.files?.[0];
        if (!file) return;

        file.text().then(text => {
            const raw = atob(text);
            const data = JSON.parse(raw) as ExportedData;

            load(data);
        });
    });
    input.click();
});

let isResetting = false;
query("#reset").addEventListener("click", () => {
    isResetting = true;
    window.localStorage.removeItem("save");
    document.location.reload();
});

window.addEventListener("beforeunload", () => {
    if (isResetting) return;
    save();
});
