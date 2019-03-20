import { Operator } from './operator';
import { Stream } from '../stream';
import { MapOperator } from './map';
import { Mapper } from '../lambdas';

export class FlatMapOperator<T, R> implements Operator<R> {

    private streamIteratorResult: IteratorResult<Stream<R>>
    private itemIterator: Iterator<R>
    private mapOperator: MapOperator<T, Stream<R>>

    constructor(
        src: Iterator<T>,
        mapper: Mapper<T, Stream<R>>
    ) {
        this.mapOperator = new MapOperator(src, mapper);
    }

    next() {
        const fetchNextItemIterator = () => {
            this.streamIteratorResult = this.mapOperator.next();
            if (!this.streamIteratorResult.done) {
                this.itemIterator = this.streamIteratorResult.value[Symbol.iterator]();
            }
        };

        do {
            if (!this.streamIteratorResult) {
                fetchNextItemIterator();
            }
            let nextItem = this.itemIterator.next();
            if (nextItem.done && !this.streamIteratorResult.done) {
                fetchNextItemIterator();
            } else if (nextItem.done && this.streamIteratorResult.done) {
                return { done: true, value: undefined };
            } else {
                return nextItem;
            }

        } while (true);
    }
}