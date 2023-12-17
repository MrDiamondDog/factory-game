import { Material } from "@type/factory";
import { query } from "@util/dom";
import { EventEmitter } from "@util/eventEmitter";
import { Log } from "@util/logger";

export type Storage = { [key in Material]: { amount: number; element?: HTMLDivElement; } }

export const storage: Storage = Object.fromEntries(Object.values(Material).map(m => [m, { amount: 0, element: undefined } ])) as Storage;
export const storageListener = new EventEmitter();

export function addToStorage(material: Material, amount: number) {
    if (storage[material] === undefined) {
        storage[material] = {
            amount: 0,
            element: undefined
        };
    }

    storage[material].amount += amount;
    if (storage[material].element)
        storage[material].element.querySelector(".amount")!.innerHTML = storage[material].amount.toString();

    storageListener.emit("add", material, amount);
    storageListener.emit("change", material, amount);

    Log("storage", `Added ${amount} ${material} to storage (Total: ${storage[material].amount}).`);
}

export function removeFromStorage(material: Material, amount: number) {
    if (storage[material] === undefined) {
        storage[material] = {
            amount: 0,
            element: undefined
        };
    }

    storage[material].amount -= amount;
    if (storage[material].element)
        storage[material].element.querySelector(".amount")!.innerHTML = storage[material].amount.toString();

    storageListener.emit("remove", material, amount);
    storageListener.emit("change", material, amount);

    Log("storage", `Removed ${amount} ${material} from storage (Total: ${storage[material].amount}).`);
}

const storageContainer = query("#storage") as HTMLDivElement;

for (const material of Object.values(Material)) {
    if (material === Material.Watts || material === Material.Any) continue;
    storageContainer.appendChild(materialToHTML(material));
}

export function materialToHTML(material: Material) {
    const div = document.createElement("div");
    div.classList.add("material");
    div.innerHTML = `
        <div class="name">${material}</div>
        <div class="amount">${storage[material].amount}</div>
    `;
    storage[material].element = div;
    return div;
}
