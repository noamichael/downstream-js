interface Operator<T> extends Iterator<T> { }

import { Comparator, Peeker, Mapper, Predicate } from './lambdas';
import { Stream } from './stream';

export class FilterOperator<T> implements Operator<T> {

    constructor(
        private src: Iterator<T>,
        private predicate: Predicate<T>
    ) { }

    next() {
        let next: IteratorResult<T>;
        do {
            next = this.src.next();
        } while (!next.done && !this.predicate(next.value));
        return { done: !next.value, value: next.value };
    }
}

export class MapOperator<T, R> implements Operator<R> {
    constructor(
        private src: Iterator<T>,
        private mapper: Mapper<T, R>
    ) { }

    next() {
        const next = this.src.next();
        return { done: next.done, value: next.done ? undefined : this.mapper(next.value) };
    }
}

export class PeekOperator<T> implements Operator<T> {
    constructor(
        private src: Iterator<T>,
        private peeker: Peeker<T>
    ) { }
    next() {
        let next = this.src.next();
        if (!next.done) {
            this.peeker(next.value);
        }
        return next;
    }
}

// export class FlatMapOperator<T, R> extends MapOperator<T, Stream<R>> {

//     private currentStream: IteratorResult<Stream<R>>
//     private itemStream: IteratorResult<R>

//     constructor(
//         private src: Iterator<T>,
//         private mapper: Mapper<T, Stream<R>>
//     ) {
//         super(src, mapper);
//     }

//     next() {
//         const extractIterator = (i) => i[Symbol.iterator]();
//         const fetchNextItemStream = () => {
//             this.itemStream = extractIterator(this.currentStream.value.toIterable());
//         };
//         const fetchNextStreamStream = () => {
//             if (this.currentStream.done) {
//                 this.currentStream = super.next();
//                 fetchNextItemStream();
//             }
//         };

//         while (true) {
//             if (this.currentStream.done) {
//                 return { done: true, value: undefined };
//             }
//             let nextR: IteratorResult<R> = extractIterator(this.currentStream.value.toIterable()).next();
//             if (!nextR.done) {
//                 return { done: false, value: nextR.value };
//             }
//             if (nextR.done && this.currentStream.done) {
//                 return nextR;
//             }
//             if (nextR.done && !this.currentStream.done) {
//                 this.currentStream = super.next();
//             }
//         }
//     }
// }