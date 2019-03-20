import { Predicate } from '../lambdas';
import { Operator } from './operator';

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