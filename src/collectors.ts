import { Mapper, Reducer } from "./lambdas";

export interface Collector<T, R> {
    (src: Iterable<T>): R
}

const identity = (i) => i;

export class Collectors {

    static toArray<T>(): Collector<T, T[]> {
        return (src) => [...src];
    }

    static toList<T>(): Collector<T, T[]> {
        return Collectors.toArray();
    }

    static joining(delimimeter = '', prefix = '', suffix = ''): Collector<string, string> {
        return (src) => {
            let it = src[Symbol.iterator]();
            let buffer = '';
            let result: IteratorResult<string>;
            
            do {
                let hadPrevious = !!result;
                result = it.next();
                if (!result.done) {
                    buffer += `${hadPrevious ? delimimeter : ''}${prefix}${result.value}${suffix}`;
                }
            } while (!result.done);

            return buffer;
        };
    }

    static toMap<K, T, R>(keyMapper: Mapper<T, K>, valueMapper?: Mapper<T, R>, mergeFunction?: Reducer<R>): Collector<T, Map<K, R>> {
        valueMapper = valueMapper || identity;
        return (src) => {
            const map = new Map<K, R>();
            for (let item of src) {
                const key = keyMapper(item);
                const mappedValue = valueMapper(item);
                if (map.has(key)) {
                    if (!mergeFunction) {
                        throw new Error(`Cannot map: duplicate entry found for (${key}) and no merge function defined.`);
                    }
                    map.set(key, mergeFunction(mappedValue, map.get(key)))
                } else {
                    map.set(key, mappedValue);
                }

            }
            return map;
        };
    }

    static groupingBy<K, T>(keyMapper: Mapper<T, K>): Collector<T, Map<K, T[]>> {
        return (src) => {
            const map: Map<K, T[]> = new Map();
            for (let item of src) {
                const key = keyMapper(item);
                if (!map.has(key)) {
                    map.set(key, []);
                }
                const group: T[] = map.get(key);
                group.push(item);
            }
            return map;
        };
    }
}