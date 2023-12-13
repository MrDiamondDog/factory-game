export function clone<T>(obj: T): T {
    return Object.assign({}, obj) as T;
}