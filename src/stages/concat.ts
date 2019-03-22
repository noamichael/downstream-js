import { Stage } from './stage';
import { BaseStream } from '../stream';

export class ConcatStage<T, S extends BaseStream<T, S>> implements Stage<T> {
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