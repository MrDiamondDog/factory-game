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
