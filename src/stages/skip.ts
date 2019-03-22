import { Stage } from './stage';

export class SkipStage<T> implements Stage<T> {

    private skipped = 0

    constructor(
        private src: Iterator<T>,
        private n: number
    ) { }

    next() {
        for (; this.skipped < this.n; this.skipped++) {
            let result = this.src.next();
            if (result.done) {
                return result;
            }
        }
        return this.src.next();
    }
}