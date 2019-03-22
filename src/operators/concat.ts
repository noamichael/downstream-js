import { Operator } from './operator';
import { BaseStream } from '../stream';

export class ConcatOperator<T, S extends BaseStream<T, S>> implements Operator<T> {
    private aDone: boolean;
    private bDone: boolean;

    constructor(
        private a: BaseStream<T, S>,
        private b: BaseStream<T, S>
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