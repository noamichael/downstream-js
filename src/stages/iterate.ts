import { Stage } from './stage';
import { Mapper } from '../lambdas';

export class IterateStage implements Stage<number> {
    private _nextVal: number
    private first = false
   
    constructor(
        seed: number, 
        private f: Mapper<number, number>
    ) { 
        this._nextVal = seed;
    }
    next() {
        if (this.first) {
            this.first = false;
        } else {
            this._nextVal = this.f(this._nextVal);
        }
        return { done: false, value: this._nextVal };
    }
}