export function weave<T>(arr: T[], arr2: T[]) {
    const result = [];
    for (let i = 0; i < Math.max(arr.length, arr2.length); i++) {
        result.push([arr[i], arr2[i]]);
    }
    return result;
}
