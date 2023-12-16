import { query } from "@util/dom";

export const elements = {
    canvas: query<HTMLCanvasElement>("#factory canvas")
};

export const ctx = elements.canvas.getContext("2d")!;

export function getColor(name: string) {
    return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`);
}

export const colors = {
    background: getColor("bg"),
    backgroundSecondary: getColor("bg-secondary"),
    backgroundTertiary: getColor("bg-tertiary"),

    text: getColor("text"),
    textSecondary: getColor("text-secondary"),

    ioPrimary: getColor("io-primary"),

    buttonPrimary: getColor("button-primary"),
    buttonSecondary: getColor("button-secondary"),
};
