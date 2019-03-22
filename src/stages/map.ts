import { Mapper } from "../lambdas";
import { Stage } from './stage';

export class MapStage<T, R> implements Stage<R> {
    constructor(
        private src: Iterator<T>,
        private mapper: Mapper<T, R>
    ) { }

    next() {
        const next = this.src.next();
        return { done: next.done, value: next.done ? undefined : this.mapper(next.value) };
    }
}