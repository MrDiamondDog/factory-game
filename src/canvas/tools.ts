import { queryAll } from "@util/dom";
import { EventEmitter } from "@util/eventEmitter";

export type Tool = "Cursor" | "Select";

export let currentTool = "Cursor" as Tool;
export const onToolChange = new EventEmitter<void>();

const buttons = queryAll<HTMLButtonElement>("#tools button");

buttons.forEach(button => {
    button.addEventListener("click", () => {
        currentTool = button.dataset.tool as Tool;
        onToolChange.emit("change");
    });
});

onToolChange.on("change", () => {
    buttons.forEach(button => {
        if (button.dataset.tool === currentTool) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }
    });
});
onToolChange.emit("change");
