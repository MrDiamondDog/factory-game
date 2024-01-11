import { MaterialPrices } from "@type/factory";
import { query } from "@util/dom";
import { EventEmitter } from "@util/eventEmitter";
import { Log } from "@util/logger";

export type Storage = { [key: string]: number }

export const storage: Storage = Object.fromEntries(Object.keys(MaterialPrices).map(m => [m, 0]));
export const storageListener = new EventEmitter<string>();

export const storageContainer = query<HTMLDivElement>("#storage");

export function clearStorage() {
    for (const material of Object.keys(MaterialPrices)) {
        if (storage[material] !== 0)
            storageListener.emit("change", material);

        storage[material] = 0;
    }
}

export function setStorage(newStorage: Storage) {
    for (const material of Object.keys(newStorage)) {
        if (storage[material] !== newStorage[material])
            storageListener.emit("change", material);

        storage[material] = newStorage[material];
    }
}

export function addToStorage(material: string, amount: number) {
    if (storage[material] === undefined) {
        storage[material] = 0;
    }

    storage[material] += amount;

    storageListener.emit("add", material);
    storageListener.emit("change", material);

    Log("storage", `Added ${amount} ${material} to storage (Total: ${storage[material]}).`);
}

export function removeFromStorage(material: string, amount: number) {
    if (storage[material] === undefined) {
        storage[material] = 0;
    }

    storage[material] -= amount;

    storageListener.emit("remove", material);
    storageListener.emit("change", material);

    Log("storage", `Removed ${amount} ${material} from storage (Total: ${storage[material]}).`);
}

for (const material of Object.keys(MaterialPrices)) {
    if (material === "Watts" || material === "Any") continue;
    storageContainer.appendChild(materialToHTML(material));
}

export function materialToHTML(material: string) {
    const div = document.createElement("div");
    div.classList.add("material");
    div.id = `material-${material.replaceAll(" ", "_")}`;
    div.innerHTML = `
        <div class="name">${material}</div>
        <div class="amount">${storage[material]}</div>
    `;
    storageContainer.appendChild(div);
    return div;
}
