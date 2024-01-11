export function addCommas(num: number) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function shorthand(num: number) {
    const suffixes = ["", "k", "M", "B", "T"];

    let suffix = 0;
    while (num >= 1000) {
        num /= 1000;
        suffix++;
    }

    return `${num.toFixed(2)}${suffixes[suffix]}`;
}

export function prettify(num: number) {
    if (num < 1000) return addCommas(num);
    return shorthand(num);
}
