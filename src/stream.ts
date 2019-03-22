import { Comparator, Consumer, Mapper, Predicate, Reducer, Supplier } from './lambdas';
import { StreamImpl, NumberStreamImpl } from './stream-support';
import { Collector } from './collectors';
import { Optional } from './util/optional';

export * from './collectors';
export * from './lambdas';
export * from './stages/stage';


export interface BaseStream<T, S extends BaseStream<T, S>> extends Iterable<T> {

    closed: boolean;

    filter(predicate: Predicate<T>): S

    map<R>(mapper: Mapper<T, R>): Stream<R>

    flatMap<R>(mapper: Mapper<T, Stream<R>>): Stream<R>

    reduce(reducer: Reducer<T>): Optional<T>
    
    reduce(reducer: Reducer<T>, identity: T): T
    
    reduce(reducer: Reducer<T>, identity: T): T | Optional<T>

    find(predicate: Predicate<T>): Optional<T>

    peek(op: Consumer<T>): S

    skip(n: number): S

    limit(n: number): S

    count(): number

    anyMatch(predicate: Predicate<T>): boolean

    allMatch(predicate: Predicate<T>): boolean

    noneMatch(predicate: Predicate<T>): boolean

    sort(comparator?: Comparator<T>): S

    min(comparator?: Comparator<T>): Optional<T>

    max(comparator?: Comparator<T>): Optional<T>

    distinct(): S

    forEach(action: (item: T) => void): void

    collect<R>(collector: Collector<T, R>): R

    concat(other: S): S

}

export interface Stream<T> extends BaseStream<T, Stream<T>> {
    
    mapToNumber(mapper: Mapper<T, number>): NumberStream;

}

export interface NumberStream extends BaseStream<number, NumberStream> {
    
    sum(): number;

    average(): Optional<number>

}

export class Downstream {

    static of<T>(it: Iterable<T>): Stream<T> {
        return new StreamImpl(it[Symbol.iterator]());
    }

    static numberStream(it: Iterable<number>): NumberStream {
        return new NumberStreamImpl(it[Symbol.iterator]());
    }

    static range(startInclusive: number, endExclusive: number): NumberStream {
        return NumberStreamImpl.range(startInclusive, endExclusive);
    }

    static rangeClosed(startInclusive: number, endInclusive: number) {
        return Downstream.range(startInclusive, endInclusive + 1);
    }

    static iterate(seed: number, f: Mapper<number, number>): NumberStream {
        return NumberStreamImpl.iterate(seed, f);
    }

    static generate(generator: Supplier<number>): NumberStream {
        return NumberStreamImpl.generate(generator);
    }

}