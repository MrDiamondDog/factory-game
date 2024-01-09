import { query } from "@util/dom";
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
