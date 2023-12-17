import { createObject, defineObject, objects } from "@canvas/object";
import { setDebug } from "@canvas/renderer";
import { addToStorage, clearStorage, setStorage, storage } from "@storage/global";
import { CanvasNode, ExportedData, ExportedFactory, FactoryDefinition, Material, NodeOptions } from "@type/factory";
import { downloadFile, query } from "@util/dom";
import { Log, transFlag } from "@util/logger";
import { roundTo } from "@util/math";

import { nodeCreatedInit, nodeDraw, nodeInit, nodeTick } from "./node";

export const machinePath = (file: string, type: string) => `machines/${type}/${file}`;
export const listPath = "machines/list.json";

export async function loadMachines() {
    const list = await fetch(listPath).then(r => r.json()) as { file: string; type: string; }[];

    const machines: FactoryDefinition[] = [];
    for (const { file, type } of list) {
        const machine = await fetch(machinePath(file, type)).then(r => r.json()) as FactoryDefinition;
        machine.type = type;
        machines.push(machine);
    }

    for (const machine of machines) {
        Log("loader", `Loaded machine ${machine.name}`);

        defineObject<NodeOptions>({
            name: machine.name,
            description: machine.description,
            type: machine.type,
            inputs: machine.inputs?.map(input => ({ stored: 0, material: input, any: input === Material.Any })),
            outputs: machine.outputs?.map(output => ({ stored: 0, material: output })),
            specs: machine.specs,
            recipe: machine.recipe,
            draw: nodeDraw,
            init: nodeInit,
            createdInit: nodeCreatedInit,
            vars: {
                cooldowns: Object.fromEntries(
                    machine.produces?.filter(produce => produce.ticks).map(produce => [produce.material, 0])
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

                if (!machine.produces) return;
                for (const produce of machine.produces) {
                    // handle cooldown if applicable
                    if (produce.ticks) {
                        const cooldown = node.vars.cooldowns[produce.material];
                        if (cooldown > 0) {
                            node.vars.cooldowns[produce.material]--;
                            continue;
                        }
                    }
                    node.vars.cooldowns[produce.material] = produce.ticks ?? 0;

                    const { amount } = produce;

                    // check if output is full
                    const output = node.outputs.find(output => output.material === produce.material);
                    const limit = produce.limit ?? Infinity;
                    if (output.stored >= limit) continue;

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
                    output.stored += amount;
                    output.stored = roundTo(output.stored, 2);
                }

                nodeTick(node);
            },
        });
    }
}

export function save() {
    const exports = objects.map(obj => {
        const node = obj as CanvasNode;
        const { name, pos, connections, id } = node;

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

        const definition = { name, pos, connections: exportedConnections, id } as ExportedFactory;

        return definition;
    });

    const out = {
        objects: exports,
        storage
    };

    const json = JSON.stringify(out);
    downloadFile("factory.json", json);
}

export function load(data: ExportedData) {
    objects.length = 0;
    clearStorage();

    const { objects: nodes, storage, DEBUG: isDebug, TRANS } = data;

    for (const node of nodes) {
        const { name, pos, id } = node;

        const nodeInstance = createObject<CanvasNode>(name, pos);
        nodeInstance.id = id;
    }

    for (const node of nodes) {
        const { connections } = node;

        const nodeInstance = objects.find(obj => obj.id === node.id) as CanvasNode;

        for (const connection of connections) {
            const { from, to } = connection;

            const fromNode = objects.find(obj => obj.id === from.id) as CanvasNode;
            const toNode = objects.find(obj => obj.id === to.id) as CanvasNode;

            const fromData = { node: fromNode, type: from.type, index: from.index };
            const toData = { node: toNode, type: to.type, index: to.index };

            nodeInstance.connections.push({ from: fromData, to: toData });
        }
    }

    setStorage(storage);

    if (isDebug) setDebug(isDebug);
    if (TRANS) {
        transFlag();
    }
}

query("#save").addEventListener("click", save);
query("#load").addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.click();

    input.addEventListener("change", () => {
        const file = input.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsText(file);

        reader.onload = () => {
            const data = JSON.parse(reader.result as string) as ExportedData;
            load(data);
        };

        reader.onerror = () => {
            console.error(reader.error);
        };
    });
});
