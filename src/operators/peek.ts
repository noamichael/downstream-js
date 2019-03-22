import { Operator } from './operator';
import { Consumer } from '../lambdas';

export class PeekOperator<T> implements Operator<T> {
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