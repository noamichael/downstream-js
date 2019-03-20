import { Stream } from './stream';
import { Comparator, Peeker, Mapper, Predicate } from './lambdas';
import { FilterOperator, MapOperator, PeekOperator } from './operators';
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

export class StreamImpl<T> {

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

    flatMap<R>(mapper: (item: T) => Stream<R>): Stream<R> {
        this.checkClosed();
        const extractIterator = (i) => i[Symbol.iterator]();
        let streamOfStreams = this.map(mapper);
        let itOfStreams = extractIterator(streamOfStreams.toIterable());
        let currentStream: IteratorResult<Stream<R>>;
        let flatOp: Iterator<R> = {
            next: () => {
                if (!currentStream) {
                    currentStream = itOfStreams.next();
                }
                while (true) {
                    if (currentStream.done) {
                        return { done: true, value: undefined };
                    }
                    let nextR: IteratorResult<R> = extractIterator(currentStream.value.toIterable()).next();
                    if (!nextR.done) {
                        return { done: false, value: nextR.value };
                    }
                    if (nextR.done && currentStream.done) {
                        return nextR;
                    }
                    if (nextR.done && !currentStream.done) {
                        currentStream = itOfStreams.next();
                    }
                }

            }
        };
        return new StreamImpl(flatOp);
    }


    reduce(reducer: (a: T, b: T) => T, identity?: T) {
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
        let skipped = 0;
        return new StreamImpl({
            next: () => {
                while (skipped < n) {
                    this.src.next();
                    skipped++;
                }
                return this.src.next();
            }
        });
    }

    limit(n: number): Stream<T> {
        this.checkClosed();
        let processed = 0;
        return new StreamImpl({
            next: () => {
                if (processed >= n) {
                    return { done: true, value: undefined };
                }
                processed++;
                return this.src.next();
            }
        });
    }

    count(): number {
        this.checkClosed(true);
        let i = 0;
        for (let el of this.toIterable()) {
            i++;
        }
        return i;
    }

    anyMatch(predicate: Predicate<T>) {
        this.checkClosed(true);
        for (let item of this.toIterable()) {
            if (predicate(item)) {
                return true;
            }
        }
        return false;
    }

    allMatch(predicate: Predicate<T>) {
        this.checkClosed(true);
        for (let item of this.toIterable()) {
            if (!predicate(item)) {
                return false;
            }
        }
        return true;

    }
    noneMatch(predicate: Predicate<T>) {
        this.checkClosed(true);
        for (let item of this.toIterable()) {
            if (predicate(item)) {
                return false;
            }
        }
        return true;
    }

    sort(comparator?: Comparator<T>) {
        const elements = this.collect(Collectors.toArray());
        elements.sort(comparator || defaultComparator);
        return new StreamImpl(elements[Symbol.isConcatSpreadable]);
    }

    min(comparator?: Comparator<T>) {
        comparator = comparator || defaultComparator;
        let min = undefined;
        for (let item of this.toIterable()) {
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
        for (let item of this.toIterable()) {
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
        for (let item of this.toIterable()) {
            action(item);
        }
    }

    collect<R>(collector: Collector<T, R[]>) {
        this.checkClosed(true);
        return collector(this.toIterable());
    }

    checkClosed(set?: boolean) {
        if (this.closed) {
            throw new Error('Stream has already been consumed');
        }
        if (set) {
            this.closed = true;
        }
    }

    toIterable() {
        return {
            [Symbol.iterator]: () => this.src
        };
    }


}