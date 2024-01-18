import { Log } from "@util/logger";

import { colors, ctx } from "@/constants";

import { Mouse } from "./input";

export const tooltip = {
    text: "",
    owner: "" as string | undefined
};

export function setTooltip(text: string, owner: string) {
    if (tooltip.owner && tooltip.owner !== owner) return;

    tooltip.text = text;
    tooltip.owner = owner;

    Log("tooltip", tooltip);
}

export function clearTooltip(owner: string) {
    if (tooltip.owner && tooltip.owner !== owner) return;

    tooltip.text = "";
    tooltip.owner = undefined;
}

export function renderTooltip() {
    if (tooltip.text === "") return;

    const lines = tooltip.text.split("\n");

    const longestLine = lines.reduce((a, b) => (a.length > b.length ? a : b));

    ctx.font = "20px Arial";
    const textSize = ctx.measureText(longestLine);

    ctx.fillStyle = colors.backgroundTertiary;
    ctx.fillRect(
        Mouse.worldPos.x,
        Mouse.worldPos.y,
        textSize.width + 10,
        (textSize.actualBoundingBoxAscent + textSize.actualBoundingBoxDescent) * lines.length + 10 + lines.length * 5
    );
    ctx.fillStyle = "white";

    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(
            lines[i],
            Mouse.worldPos.x + 5,
            Mouse.worldPos.y + (textSize.actualBoundingBoxAscent + textSize.actualBoundingBoxDescent + 5) * i + 5
        );
    }
}
