import { query } from "@util/dom";

export const canvas = query<HTMLCanvasElement>("#factory canvas");

export const ctx = canvas.getContext("2d")!;

export const { version, changelog } = await fetch("version.json")
    .then(res => res.json())
    .then(json => ({ version: json.version as string, changelog: json.changelog as string[] }));

const lastVersion = window.localStorage.getItem("last-version");
if (lastVersion !== version) {
    const changelogElem = query("#changelog");
    changelogElem.style.display = "block";

    query<HTMLButtonElement>("#changelog-close").addEventListener("click", () => {
        changelogElem.style.display = "none";
    });

    query("#changelog-stuff").innerHTML = changelog.map(line => `- ${line}`).join("<br>");
}

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
