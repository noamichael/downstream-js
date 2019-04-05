import { Comparator, Consumer, Mapper, Predicate, Reducer, Supplier } from './lambdas';
import { StreamImpl, NumberStreamImpl } from './stream-support';
import { Collector } from './collectors';
import { Optional } from './util/optional';

export * from './collectors';
export * from './lambdas';
export * from './stages/stage';


export interface BaseStream<T, S extends BaseStream<T, S>> extends Iterable<T> {
    
    /**
     * Returns true if this stream has already been comsumed.
     */
    closed: boolean;
    /**
     * Returns a stream consisting of the elements of this stream that match the given predicate.
     * @param predicate  a predicate to apply to each element to determine if it should be included
     */
    filter(predicate: Predicate<T>): S
    /**
     * Returns a stream consisting of the results of applying the given function to the elements of this stream.
     * @param mapper The function to apply to each element of the stream
     */
    map<R>(mapper: Mapper<T, R>): Stream<R>

    /**
     * Returns a stream consisting of the results of replacing each element of this stream with the contents of 
     * a mapped stream produced by applying the provided mapping function to each element.
     * Each mapped stream is closed after its contents have been placed into this stream. (If a mapped stream 
     * is null an empty stream is used, instead.)
     * @param mapper 
     */
    flatMap<R>(mapper: Mapper<T, Stream<R>>): Stream<R>
    /**
     * Returns a stream consisting of the distinct elements (according to == semantics) of this stream.
     */
    distinct(): S
    /**
     * Performs a reduction on the elements of this stream, using an associative accumulation function, 
     * and returns an Optional describing the reduced value, if any
     * @param reducer function for combining two values 
     */
    reduce(reducer: Reducer<T>): Optional<T>
    /**
     * Performs a reduction on the elements of this stream, using the provided identity and accumulation.
     * 
     * @param reducer function for combining two values
     * @param identity the identity value for the accumulating function
     */
    reduce(reducer: Reducer<T>, identity: T): T
    /**
     * Performs a reduction on the elements of this stream, using the provided identity and accumulation.
     * 
     * @param reducer function for combining two values
     * @param identity the identity value for the accumulating function
     */
    reduce(reducer: Reducer<T>, identity: T): T | Optional<T>
    /**
     * Returns a stream consisting of the elements of this stream, sorted according to the default 
     * comparison operatators applied to the elements.
     */
    sorted(): S
     /**
     * Returns a stream consisting of the elements of this stream, sorted according to the provided Comparator.
     */
    sorted(comparator?: Comparator<T>): S
    /**
     * Returns an Optional describing some element of the stream, or an empty Optional if the stream is empty.
     */
    find(predicate: Predicate<T>): Optional<T>
    /**
     * Returns a stream consisting of the elements of this stream, additionally performing the provided action 
     * on each element as elements are consumed from the resulting stream.
     * @param op The operation to run for each element
     */
    peek(op: Consumer<T>): S
    /**
     * Returns a stream consisting of the remaining elements of this stream after discarding the first n elements of the stream.
     * @param n the number of leading elements to skip
     */
    skip(n: number): S
    /**
     * Returns a stream consisting of the elements of this stream, truncated to be no longer than maxSize in length.
     * @param maxSize 
     */
    limit(maxSize: number): S
    /**
     * Returns the count of elements in this stream.
     */
    count(): number
    /**
     * Returns whether any elements of this stream match the provided predicate. May not evaluate the predicate 
     * on all elements if not necessary for determining the result. If the stream is empty then false is returned 
     * and the predicate is not evaluated.
     * @param predicate The predicate function to use
     */
    anyMatch(predicate: Predicate<T>): boolean
    /**
     * Returns whether all elements of this stream match the provided predicate. May not evaluate the predicate 
     * on all elements if not necessary for determining the result. If the stream is empty then true is returned 
     * and the predicate is not evaluated.
     * @param predicate The predicate function to use
     */
    allMatch(predicate: Predicate<T>): boolean
    /**
     * Returns whether no elements of this stream match the provided predicate. May not evaluate the predicate 
     * on all elements if not necessary for determining the result. If the stream is empty then true is 
     * returned and the predicate is not evaluated.
     * @param predicate predicate to apply to elements of this stream
     */
    noneMatch(predicate: Predicate<T>): boolean
    /**
     * Returns the minimum element of this stream according to the provided Comparator
     * @param comparator Comparator to compare elements of this stream
     */
    min(comparator?: Comparator<T>): Optional<T>
    /**
     * Returns the maximum element of this stream according to the provided Comparator.
     * @param comparator Comparator to compare elements of this stream
     */
    max(comparator?: Comparator<T>): Optional<T>
    /**
     * Performs an action for each element of this stream.
     * @param action The action to run for each element
     */
    forEach(action: (item: T) => void): void
    /**
     * Collects all the elements in this stream into a collection
     * @param collector 
     */
    collect<R>(collector: Collector<T, R>): R
    /**
     * Creates a lazily concatenated stream whose elements are all the elements of the 
     * first stream followed by all the elements of the second stream.
     * @param other the stream to concat
     */
    concat(other: S): S

}

export interface Stream<T> extends BaseStream<T, Stream<T>> {
    /**
     * Returns a NumberStream consisting of the results of applying the given function to the elements of this stream.
     * @param mapper the function to apply to each element of the stream 
     */
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