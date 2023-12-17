import cloneDeep from "lodash/cloneDeep";

export function clone<T>(obj: T): T {
    return cloneDeep(obj);
}
