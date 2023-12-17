import { TabSettings } from "@type/util/dom";

export const cache = new Map<string, HTMLElement>();

export function query<T extends HTMLElement>(query: string): T {
    if (cache.get(query)) return cache.get(query) as T;

    const elem = document.querySelector(query) as T;
    cache.set(query, elem);
    return elem;
}

export function queryElement<T extends HTMLElement>(from: HTMLElement, query: string): T {
    return from.querySelector(query) as T;
}

export function queryAll<T extends HTMLElement>(query: string): T[] {
    return Array.from(document.querySelectorAll(query)) as T[];
}

export function tabs(options: TabSettings) {
    const { tabsContainer, buttonsContainer } = options;

    const tabs = tabsContainer.children;
    const buttons = buttonsContainer.children;

    for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i] as HTMLDivElement;
        const button = buttons[i] as HTMLButtonElement;

        button.addEventListener("click", () => {
            for (const tab of tabs) tab.classList.remove("active");
            tab.classList.add("active");

            for (const button of buttons) button.classList.remove("active");
            button.classList.add("active");
        });
    }
}

export function downloadFile(filename: string, data: string) {
    const blob = new Blob([data], { type: "text/plain;charset=utf-8" });
    saveAs(blob, filename);
}

export function saveAs(blob: Blob, filename: string) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}
