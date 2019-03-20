import { Mapper } from "../lambdas";
import { Operator } from './operator';

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