import { Material } from "@type/factory";
import { query, queryElement } from "@util/dom";
import { EventEmitter } from "@util/eventEmitter";
import { Log } from "@util/logger";

export type Storage = { [key in Material]: number }

export const storage: Storage = Object.fromEntries(Object.values(Material).map(m => [m, 0])) as Storage;
export const storageListener = new EventEmitter();

export const storageContainer = query<HTMLDivElement>("#storage");

export function clearStorage() {
    for (const material of Object.values(Material)) {
        storage[material] = 0;
    }
    updateStorage();
}

export function setStorage(newStorage: Storage) {
    for (const material of Object.values(Material)) {
        storage[material] = newStorage[material];
    }
    updateStorage();
}

export function updateStorage() {
    for (const material of Object.values(Material)) {
        if (storage[material])
            queryElement(storageContainer, `#material-${material.replaceAll(" ", "_")} .amount`).innerHTML = storage[material].toString();
    }
}

export function addToStorage(material: Material, amount: number) {
    if (storage[material] === undefined) {
        storage[material] = 0;
    }

    storage[material] += amount;
    updateStorage();

    storageListener.emit("add", material, amount);
    storageListener.emit("change", material, amount);

    Log("storage", `Added ${amount} ${material} to storage (Total: ${storage[material]}).`);
}

export function removeFromStorage(material: Material, amount: number) {
    if (storage[material] === undefined) {
        storage[material] = 0;
    }

    storage[material] -= amount;
    updateStorage();

    storageListener.emit("remove", material, amount);
    storageListener.emit("change", material, amount);

    Log("storage", `Removed ${amount} ${material} from storage (Total: ${storage[material]}).`);
}

for (const material of Object.values(Material)) {
    if (material === Material.Watts || material === Material.Any) continue;
    storageContainer.appendChild(materialToHTML(material));
}

export function materialToHTML(material: Material) {
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
