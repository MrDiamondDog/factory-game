import { defineObject } from "@canvas/object";
import { addToStorage } from "@storage/global";
import { CanvasNode, FactoryDefinition, NodeOptions } from "@type/factory";
import { Log } from "@util/logger";
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
            inputs: machine.inputs?.map(input => ({ stored: 0, material: input })),
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
