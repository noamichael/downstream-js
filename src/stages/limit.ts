export class LimitStage<T> {
    
    private processed: number = 0;

    constructor(
        private src: Iterator<T>,
        private n: number
    ) { }

    next() {
        if (this.processed >= this.n) {
            return { done: true, value: undefined };
        }
        this.processed++;
        return this.src.next();
    }
}