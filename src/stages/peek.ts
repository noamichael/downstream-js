import { Stage } from './stage';
import { Consumer } from '../lambdas';

export class PeekStage<T> implements Stage<T> {
    constructor(
        private src: Iterator<T>,
        private peeker: Consumer<T>
    ) { }
    next() {
        let next = this.src.next();
        if (!next.done) {
            this.peeker(next.value);
        }
        return next;
    }
}