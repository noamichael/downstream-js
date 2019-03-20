export interface Collector<T, R> {
    (src: Iterable<T>): R
}

export class Collectors {
    static toArray<T>(): Collector<T, T[]> {
        return (src) => {
            const result = [];
            for (let item of src) {
                result.push(item);
            }
            return result;
        };
    }
}