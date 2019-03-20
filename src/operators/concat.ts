import { Operator } from './operator';
import { Stream } from '../stream';

export class ConcatOperator<T> implements Operator<T> {
    private aDone: boolean;
    private bDone: boolean;

    constructor(
        private a: Stream<T>,
        private b: Stream<T>
    ) { }

    next() {
        if (this.bDone) {
            return { done: true, value: undefined };
        }
        let next: IteratorResult<T>;
        if (!this.aDone) {
            next = this.a[Symbol.iterator]().next();
            this.aDone = next.done;
        }
        if (this.aDone) {
            next = this.b[Symbol.iterator]().next();
            this.bDone = next.done;
        }
        return next;
    }

}