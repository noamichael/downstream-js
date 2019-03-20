import { Comparator, Peeker, Mapper, Predicate, Reducer } from './lambdas';
import { StreamImpl } from './stream-support';
import { Collector } from './collectors';

export * from './collectors';
export * from './lambdas';
export * from './operators/operators';


export interface Stream<T> extends Iterable<T> {

    closed: boolean;

    filter(predicate: Predicate<T>): Stream<T>

    map<R>(mapper: Mapper<T, R>): Stream<R>

    flatMap<R>(mapper: Mapper<T, Stream<R>>): Stream<R>

    reduce(reducer: Reducer<T>, identity?: T)

    find(predicate: Predicate<T>)

    peek(op: Peeker<T>): Stream<T>

    skip(n: number): Stream<T>

    limit(n: number): Stream<T>

    count(): number

    anyMatch(predicate: Predicate<T>): boolean

    allMatch(predicate: Predicate<T>): boolean

    noneMatch(predicate: Predicate<T>): boolean

    sort(comparator?: Comparator<T>): Stream<T>

    min(comparator?: Comparator<T>): T

    max(comparator?: Comparator<T>): T

    distinct(): Stream<T>

    forEach(action: (item: T) => void): void

    collect<R>(collector: Collector<T, R>): R

    concat(other: Stream<T>): Stream<T>;

}

export class Downstream {

    static of<T>(it: Iterable<T>): Stream<T> {
        return new StreamImpl(it[Symbol.iterator]());
    }

}