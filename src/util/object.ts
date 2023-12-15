import { cloneDeep } from "lodash";

export function clone<T>(obj: T): T {
    return cloneDeep(obj);
}
