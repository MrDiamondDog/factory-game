import { query } from "@util/dom";

export const canvas = query<HTMLCanvasElement>("#factory canvas");

export const ctx = canvas.getContext("2d")!;

export const version = await fetch("version.json").then(res => res.json()).then(json => json.version);

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

export const transferSpeed = 1;
