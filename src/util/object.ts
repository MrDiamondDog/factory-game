import cloneDeep from "lodash/cloneDeep";

export function clone<T>(obj: T): T {
    return cloneDeep(obj);
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
