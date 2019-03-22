import { Stage } from './stage';
import { Stream } from '../stream';
import { MapStage } from './map';
import { Mapper } from '../lambdas';

export class FlatMapStage<T, R> implements Stage<R> {

    private streamIteratorResult: IteratorResult<Stream<R>>
    private itemIterator: Iterator<R>
    private mapStage: MapStage<T, Stream<R>>

    constructor(
        src: Iterator<T>,
        mapper: Mapper<T, Stream<R>>
    ) {
        this.mapStage = new MapStage(src, mapper);
    }

    next() {
        const fetchNextItemIterator = () => {
            this.streamIteratorResult = this.mapStage.next();
            if (!this.streamIteratorResult.done) {
                this.itemIterator = this.streamIteratorResult.value[Symbol.iterator]();
            }
        };

        do {
            if (!this.streamIteratorResult) {
                fetchNextItemIterator();
            }
            if (!this.itemIterator) {//empty stream
                return { done: true, value: undefined };
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