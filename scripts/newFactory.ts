import { prompt } from "enquirer";
import fs from "fs";
import path from "path";

async function ask(question: string, optional: boolean = true): Promise<string> {
    const input = await prompt({
        type: "input",
        name: "value",
        message: question
    }).then((answer: any) => answer.value);

    if (!input || input.trim().length === 0) {
        if (optional) return "";
        return await ask(question, optional) as string;
    }

    return input;
}

(async () => {
    const factoryName = await ask("Factory Name", true);
    const factoryType = await ask("Factory Type", true);

    const factoryPath = path.join(__dirname, `../machines/${factoryType}/`);

    const json = {
        "name": factoryName,
        "description": await ask("Factory Description", true),
        "type": factoryType,
        "inputs": undefined as string[] | undefined,
        "outputs": undefined as string[] | undefined,
        "specs": [] as string[],
        "cost": parseInt(await ask("Factory Cost", true)),
        "produces": [] as any[]
    };

    const inputs = await ask("Factory Inputs (comma separated)");
    if (inputs !== "") json.inputs = inputs.split(",").map((input: string) => input.trim());
    const outputs = await ask("Factory Outputs (comma separated)");
    if (outputs !== "") json.outputs = outputs.split(",").map((output: string) => output.trim());

    for (let i = 0; i < (json.outputs ? json.outputs.length : 0); i++) {
        const output = json.outputs![i];
        const produce = {
            "materials": [
                {
                    "material": output,
                    "amount": 0,
                    "limit": undefined as number | undefined
                }
            ],
            "time": {
                "seconds": undefined as number | undefined,
                "ticks": undefined as number | undefined
            } as any | undefined,
            "requires": [] as any[] | undefined,
        };

        const amount = await ask(`Amount of ${output} produced`, true);
        produce.materials[0].amount = parseInt(amount);
        const limit = await ask(`Limit of ${output} produced`);
        if (limit !== "") produce.materials[0].limit = parseInt(limit);

        const time = await ask("Requires time to produce? (y/N)");
        if (time === "y") {
            const seconds = await ask("Time to produce in seconds");
            if (seconds !== "") produce.time.seconds = parseInt(seconds);
            else {
                const ticks = await ask("Time to produce in ticks");
                if (ticks !== "") produce.time.ticks = parseInt(ticks);
            }

            if (!produce.time.seconds && !produce.time.ticks) {
                delete produce.time;
            }
        } else {
            delete produce.time;
        }

        const requires = await ask("Requires materials? (Y/n)");
        if (requires === "y" || requires === "") {
            const materials = await ask("Required materials (comma separated, \"material:amount\")", true);
            if (materials !== "") produce.requires = materials.split(",").map((material: string) => {
                const split = material.split(":");
                return {
                    "material": split[0].trim(),
                    "amount": parseInt(split[1].trim())
                };
            });
        } else {
            delete produce.requires;
        }

        json.produces.push(produce);

        // :husk:
        json.specs.push(`${produce.requires ?
            produce.requires?.map((material: any) => material.material === "Watts" ? `*${material.amount}w*` : `*${material.amount} ${material.material}*`).join(" + ") : ""
        }${produce.time.seconds ? `${produce.requires ? " + " : ""}*${produce.time.seconds}s*` : ""}${produce.time.ticks ? `${produce.requires ? " + " : ""}*${produce.time.ticks}t*` : ""} -> ${
            produce.materials.map((material: any) => material.material === "Watts" ? `*${material.amount}w*` : `*${material.amount} ${material.material}*`).join(" + ")
        }`);

        produce.materials.forEach((material: any) => {
            if (!material.limit) return;
            if (material.material === "Watts") json.specs.push(`Stores *${material.limit}w*`);
            json.specs.push(`Stores *${material.limit} ${material.material}*`);
        });
    }

    if (!fs.existsSync(factoryPath)) {
        // create the path
        fs.mkdirSync(factoryPath);
    }

    fs.writeFileSync(`${factoryPath}${factoryName.replace(/ /g, "_").toLowerCase()}.json`, JSON.stringify(json, null, 4));
})();
