import { MaterialType } from "@type/factory";
import { query, queryElement } from "@util/dom";
import { EventEmitter } from "@util/eventEmitter";
import { Log } from "@util/logger";

export type Storage = { [key in MaterialType]: number }

export const storage: Storage = Object.fromEntries(Object.values(MaterialType).map(m => [m, 0])) as Storage;
export const storageListener = new EventEmitter<MaterialType>();

export const storageContainer = query<HTMLDivElement>("#storage");

export function clearStorage() {
    for (const material of Object.values(MaterialType)) {
        if (storage[material] !== 0)
            storageListener.emit("change", material);

        storage[material] = 0;
    }
    updateStorage();
}

export function setStorage(newStorage: Storage) {
    for (const material of Object.values(MaterialType)) {
        if (storage[material] !== newStorage[material])
            storageListener.emit("change", material);

        storage[material] = newStorage[material];
    }
    updateStorage();
}

export function updateStorage() {
    for (const material of Object.values(MaterialType)) {
        if (material === MaterialType.Watts || material === MaterialType.Any) continue;
        Log("storage", `Updating storage for ${material}`);
        if (storage[material])
            queryElement(storageContainer, `#material-${material.replaceAll(" ", "_")} .amount`).innerHTML = storage[material].toString();
    }
}

export function addToStorage(material: MaterialType, amount: number) {
    if (storage[material] === undefined) {
        storage[material] = 0;
    }

    storage[material] += amount;
    updateStorage();

    storageListener.emit("add", material);
    storageListener.emit("change", material);

    Log("storage", `Added ${amount} ${material} to storage (Total: ${storage[material]}).`);
}

export function removeFromStorage(material: MaterialType, amount: number) {
    if (storage[material] === undefined) {
        storage[material] = 0;
    }

    storage[material] -= amount;
    updateStorage();

    storageListener.emit("remove", material);
    storageListener.emit("change", material);

    Log("storage", `Removed ${amount} ${material} from storage (Total: ${storage[material]}).`);
}

for (const material of Object.values(MaterialType)) {
    if (material === MaterialType.Watts || material === MaterialType.Any) continue;
    storageContainer.appendChild(materialToHTML(material));
}

export function materialToHTML(material: MaterialType) {
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
