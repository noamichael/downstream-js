import { Stream } from './stream';
import { Comparator, Peeker, Mapper, Predicate, Reducer } from './lambdas';
import { FilterOperator, MapOperator, PeekOperator, FlatMapOperator, SkipOperator, LimitOperator, ConcatOperator } from './operators/operators';
import { Collector, Collectors } from './collectors';

function defaultComparator(a: any, b: any) {
    if (a > b) {
        return 1;
    }
    if (a < b) {
        return -1;
    }
    return 0;
}

export class StreamImpl<T> implements Stream<T>{

    closed: boolean = false;

    constructor(private src: Iterator<T>) { }


    filter(predicate: Predicate<T>): Stream<T> {
        this.checkClosed();
        return new StreamImpl(new FilterOperator(this.src, predicate));
    }

    map<R>(mapper: Mapper<T, R>): Stream<R> {
        this.checkClosed();
        return new StreamImpl(new MapOperator(this.src, mapper));
    }

    flatMap<R>(mapper: Mapper<T, Stream<R>>): Stream<R> {
        this.checkClosed();
        return new StreamImpl(new FlatMapOperator(this.src, mapper));
    }

    reduce(reducer: Reducer<T>, identity?: T) {
        this.checkClosed(true);
        let elements = this.collect(Collectors.toArray());
        let result = identity;
        for (let element of elements) {
            result = reducer(result, element);
        }
        return result;
    }

    find(predicate: Predicate<T>) {
        this.checkClosed(true);
        let next;
        do {
            next = this.src.next();
        } while (!next.done && !predicate(next.value));
        return next.value;
    }

    peek(op: Peeker<T>): Stream<T> {
        this.checkClosed();
        return new StreamImpl(new PeekOperator(this.src, op));
    }

    skip(n: number): Stream<T> {
        this.checkClosed();
        return new StreamImpl(new SkipOperator(this.src, n));
    }

    limit(n: number): Stream<T> {
        this.checkClosed();
        return new StreamImpl(new LimitOperator(this.src, n));
    }

    count(): number {
        this.checkClosed(true);
        let i = 0;
        for (let el of this) {
            i++;
        }
        return i;
    }

    anyMatch(predicate: Predicate<T>) {
        this.checkClosed(true);
        for (let item of this) {
            if (predicate(item)) {
                return true;
            }
        }
        return false;
    }

    allMatch(predicate: Predicate<T>) {
        this.checkClosed(true);
        for (let item of this) {
            if (!predicate(item)) {
                return false;
            }
        }
        return true;

    }
    noneMatch(predicate: Predicate<T>) {
        this.checkClosed(true);
        for (let item of this) {
            if (predicate(item)) {
                return false;
            }
        }
        return true;
    }

    sort(comparator?: Comparator<T>): Stream<T> {
        const elements = this.collect(Collectors.toArray());
        elements.sort(comparator || defaultComparator);
        return new StreamImpl(elements[Symbol.iterator]());
    }

    min(comparator?: Comparator<T>) {
        comparator = comparator || defaultComparator;
        let min = undefined;
        for (let item of this) {
            if (!min) {
                min = item;
                continue;
            }
            if (comparator(item, min) < 0) {
                min = item;
            }
        }
        return min;
    }

    max(comparator?: Comparator<T>) {
        comparator = comparator || defaultComparator;
        let max = undefined;
        for (let item of this) {
            if (!max) {
                max = item;
                continue;
            }
            if (comparator(item, max) > 0) {
                max = item;
            }
        }
        return max;
    }

    distinct() {
        const seen = [];
        return this.filter(i => {
            const alreadySeen = seen.indexOf(i) > -1;
            if (alreadySeen) {
                return false;
            }
            seen.push(i);
            return true;
        });
    }

    forEach(action: (item: T) => void) {
        this.checkClosed(true);
        for (let item of this) {
            action(item);
        }
    }

    collect<R>(collector: Collector<T, R>) {
        this.checkClosed(true);
        return collector(this);
    }

    concat<T>(other: Stream<T>): Stream<T> {
        return new StreamImpl(new ConcatOperator(this, other));
    }

    checkClosed(set?: boolean) {
        if (this.closed) {
            throw new Error('Stream has already been consumed');
        }
        if (set) {
            this.closed = true;
        }
    }

    [Symbol.iterator]() {
        return this.src;
    }


}