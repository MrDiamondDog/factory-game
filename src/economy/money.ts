import { addToStorage, storage, storageListener } from "@economy/storage";
import { MaterialPrices } from "@type/factory";
import { query, queryAll } from "@util/dom";
import { EventEmitter } from "@util/eventEmitter";

export let money = 200;

export function setMoney(newMoney: number) {
    money = newMoney;
    onMoneyChange.emit("change", newMoney);
}

export const onMoneyChange = new EventEmitter<number>();

const moneyElement = query("#money") as HTMLHeadingElement;
onMoneyChange.on("change", money => {
    moneyElement.textContent = `$${money}`;
});

const shopTab = query("#shop-tab") as HTMLDivElement;

function renderShop() {
    shopTab.innerHTML = "<h1>Sell</h1>" + Object.keys(MaterialPrices).map((material: string) => {
        if (material === "Any" || material === "Watts") return "";
        return `
        <div class="shop-item">
            <h3>${material}</h3>
            <p class="price">$${MaterialPrices[material]}</p>
            <p>${storage[material]} owned</p>
            <div class="sell-buttons" data-material="${material}">
                <button class="sell-one">x1</button>
                <button class="sell-five">x5</button>
                <button class="sell-ten">x10</button>
                <button class="sell-all">All</button>
            </div>
        </div>
        `;
    }).join("");

    const sellButtons = queryAll<HTMLDivElement>(".sell-buttons");

    for (const button of sellButtons) {
        const { material } = button.dataset;
        const materialAmount = storage[material];

        const sellOne = button.querySelector<HTMLButtonElement>(".sell-one");
        const sellFive = button.querySelector<HTMLButtonElement>(".sell-five");
        const sellTen = button.querySelector<HTMLButtonElement>(".sell-ten");
        const sellAll = button.querySelector<HTMLButtonElement>(".sell-all");

        sellOne.disabled = materialAmount < 1;
        sellFive.disabled = materialAmount < 5;
        sellTen.disabled = materialAmount < 10;
        sellAll.disabled = materialAmount < 1;

        sellOne.addEventListener("click", () => {
            if (materialAmount >= 1) {
                setMoney(money + MaterialPrices[material]);
                addToStorage(material, -1);
            }
        });
        sellFive.addEventListener("click", () => {
            if (materialAmount >= 5) {
                setMoney(money + MaterialPrices[material] * 5);
                addToStorage(material, -5);
            }
        });
        sellTen.addEventListener("click", () => {
            if (materialAmount >= 10) {
                setMoney(money + MaterialPrices[material] * 10);
                addToStorage(material, -10);
            }
        });
        sellAll.addEventListener("click", () => {
            if (materialAmount >= 1) {
                setMoney(money + MaterialPrices[material] * materialAmount);
                addToStorage(material, -materialAmount);
            }
        });
    }
}
renderShop();
storageListener.on("change", renderShop);
