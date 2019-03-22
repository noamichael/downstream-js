import { Stream, NumberStream, BaseStream } from './stream';
import { Comparator, Consumer, Mapper, Predicate, Reducer, Supplier } from './lambdas';
import { FilterStage, MapStage, PeekStage, FlatMapStage, SkipStage, LimitStage, ConcatStage } from './stages/stages';
import { Collector, Collectors } from './collectors';
import { Optional } from './util/optional';
import { defaultComparator } from './util/comparator';
import { Stage } from './stages/stage';
import { RangeStage, IterateStage } from './stages/number-stages';


interface StreamConstructor<T, S> {
    new(src: Iterator<T>): S;
}

abstract class BaseStreamImpl<T, S extends BaseStream<T, S>> implements BaseStream<T, S> {

    closed: boolean = false;

    constructor(
        protected src: Iterator<T>,
        protected StreamConstructor: StreamConstructor<T, S>
    ) { }


    filter(predicate: Predicate<T>): S {
        this.checkClosed();
        return new this.StreamConstructor(new FilterStage(this.src, predicate));
    }

    map<R>(mapper: Mapper<T, R>): Stream<R> {
        this.checkClosed();
        return new StreamImpl(new MapStage(this.src, mapper));
    }

    flatMap<R>(mapper: Mapper<T, Stream<R>>): Stream<R> {
        this.checkClosed();
        return new StreamImpl(new FlatMapStage(this.src, mapper));
    }

    reduce(reducer: Reducer<T>): Optional<T>;
    reduce(reducer: Reducer<T>, identity: T): T
    reduce(reducer: Reducer<T>, identity?: T): T | Optional<T> {
        this.checkClosed(true);
        let result = identity;
        let count = 0;
        for (let element of this) {
            result = reducer(result, element);
            count++;
        }
        if (count == 0) {
            return Optional.empty();
        }
        return identity ? result : new Optional(result);
    }

    find(predicate: Predicate<T>): Optional<T> {
        this.checkClosed(true);
        let next;
        do {
            next = this.src.next();
        } while (!next.done && !predicate(next.value));
        return new Optional(next.value);
    }

    peek(op: Consumer<T>): S {
        this.checkClosed();
        return new this.StreamConstructor(new PeekStage(this.src, op));
    }

    skip(n: number): S {
        this.checkClosed();
        return new this.StreamConstructor(new SkipStage(this.src, n));
    }

    limit(n: number): S {
        this.checkClosed();
        return new this.StreamConstructor(new LimitStage(this.src, n));
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

    sort(comparator?: Comparator<T>): S {
        const elements = this.collect(Collectors.toArray());
        elements.sort(comparator || defaultComparator);
        return new this.StreamConstructor(elements[Symbol.iterator]());
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
        return new Optional(min);
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
        return new Optional(max);
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

    concat(other: S): S {
        return new this.StreamConstructor(new ConcatStage(this, other));
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

class ToNumberStream<T> implements Stage<number>{

    constructor(
        private src: Iterator<T>,
        private mapper: Mapper<T, number>
    ) { }

    next() {
        const { done, value } = this.src.next();
        return { done, value: this.mapper(value) };
    }
}

export class StreamImpl<T> extends BaseStreamImpl<T, Stream<T>> implements Stream<T>{

    constructor(src: Iterator<T>) {
        super(src, StreamImpl);
    }

    mapToNumber(mapper: Mapper<T, number>): NumberStream {
        return new NumberStreamImpl(new ToNumberStream(this.src, mapper));
    }

}

export class NumberStreamImpl extends BaseStreamImpl<number, NumberStream> implements NumberStream {

    constructor(src: Iterator<number>) {
        super(src, NumberStreamImpl);
    }

    sum() {
        return this.reduce((a, b) => a + b, 0);
    }
    average() {
        let count = 0;
        let sum = 0;
        for (let num of this) {
            sum += num;
            count++;
        }
        return count == 0 ? Optional.empty() : new Optional(sum / count);
    }

    static range(startInclusive: number, endExclusive: number): NumberStream {
        return new NumberStreamImpl(new RangeStage(startInclusive, endExclusive));
    }

    static iterate(seed: number, f: Mapper<number, number>) {
        return new NumberStreamImpl(new IterateStage(seed, f));
    }

    static generate(generator: Supplier<number>): NumberStream {
        return new NumberStreamImpl({
            next() {
                return { done: false, value: generator() };
            }
        });
    }
}