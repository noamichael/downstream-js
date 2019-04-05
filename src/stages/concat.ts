import { Stage } from './stage';
import { BaseStream } from '../stream';

export class ConcatStage<T, S extends BaseStream<T, S>> implements Stage<T> {
    private aDone: boolean;
    private bDone: boolean;

    private itA: Iterator<T>
    private itB: Iterator<T>

    constructor(
        a: BaseStream<T, S>,
        b: BaseStream<T, S>
    ) {
        this.itA = a[Symbol.iterator]();
        this.itB = b[Symbol.iterator]();
    }

    next() {
        if (this.bDone) {
            return { done: true, value: undefined };
        }
        let next: IteratorResult<T>;
        if (!this.aDone) {
            next = this.itA.next();
            this.aDone = next.done;
        }
        if (this.aDone) {
            next = this.itB.next();
            this.bDone = next.done;
        }
        return next;
    }

}