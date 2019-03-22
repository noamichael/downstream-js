import { Predicate } from '../lambdas';
import { Stage } from './stage';

export class FilterStage<T> implements Stage<T> {

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