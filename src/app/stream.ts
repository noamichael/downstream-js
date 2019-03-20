import { Comparator, Peeker, Mapper, Predicate } from './lambdas';
import { StreamImpl } from './stream-support';
import { Collector } from './collectors';

export * from './collectors';
export * from './lambdas';
export * from './operators';


export interface Stream<T> {

    closed: boolean;

    filter(predicate: Predicate<T>): Stream<T>

    map<R>(mapper: Mapper<T, R>): Stream<R>

    flatMap<R>(mapper: (item: T) => Stream<R>): Stream<R>

    reduce(reducer: (a: T, b: T) => T, identity?: T)

    find(predicate: Predicate<T>)

    peek(op: Peeker<T>): Stream<T>

    skip(n: number): Stream<T>

    limit(n: number): Stream<T>

    count(): number

    anyMatch(predicate: Predicate<T>)

    allMatch(predicate: Predicate<T>)

    noneMatch(predicate: Predicate<T>)

    sort(comparator?: Comparator<T>)

    min(comparator?: Comparator<T>)

    max(comparator?: Comparator<T>)

    distinct()

    forEach(action: (item: T) => void)

    collect<R>(collector: Collector<T, R[]>)

    toIterable(): Iterable<T>

}

export class Downstream {

    static of<T>(it: Iterable<T>): Stream<T> {
        return new StreamImpl(it[Symbol.iterator]());
    }

    // static concat<T>(a: Stream<T>, b: Stream<T>): Stream<T> {
    //     let aDone = false, bDone = false;;
    //     return new StreamImpl({
    //         next: () => {
    //             if (bDone) {
    //                 return { done: true, value: undefined };
    //             }
    //             let next;
    //             if (!aDone) {
    //                 next = a.src.next();
    //                 aDone = next.done();
    //             }
    //             if (aDone) {
    //                 next = b.src.next();
    //                 bDone = next.done();
    //             }
    //             return next;
    //         }
    //     });
    // }
}