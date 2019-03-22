import { Stage } from './stage';

export class RangeStage implements Stage<number> {
    private _nextVal: number
    constructor(
        startInclusive: number, 
        private endExclusive: number
    ) { 
        this._nextVal = startInclusive;
    }
    next() {
        if (this._nextVal >= this.endExclusive) {
            return { done: true, value: undefined };
        }
        return { done: false, value: this._nextVal++ };
    }
}