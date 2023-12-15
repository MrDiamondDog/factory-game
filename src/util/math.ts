export function clamp(num: number, min: number, max: number) {
    return Math.min(Math.max(num, min), max);
}

export function roundTo(num: number, precision: number) {
    const factor = 10 ** precision;
    return Math.round(num * factor) / factor;
}
