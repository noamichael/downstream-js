import { Operator } from './operator';

export class SkipOperator<T> implements Operator<T> {

    constructor(
        private src: Iterator<T>,
        private n: number
    ) { }
    
    next() {
        let skipped = 0;
        while (skipped < this.n) {
            this.src.next();
            skipped++;
        }
        return this.src.next();
    }
}