interface Collector<T, R> {
    (src: Iterable<T>): R
}

interface Predicate<T> {
    (item: T): boolean
}

export class Stream<T> {

    closed: boolean = false;

    constructor(private src: Iterator<T>) { }

    static toArray<T>(): Collector<T, T[]> {
        return (src) => {
            const result = [];
            for (let item of src) {
                result.push(item);
            }
            return result;
        };
    }

    static of<T>(it: Iterable<T>) {
        return new Stream(it[Symbol.iterator]());
    }

    static concat<T>(a: Stream<T>, b: Stream<T>) {
        return new Stream({
            next: () => {
                let next = a.src.next();
                if (next.done) {
                    next = b.src.next();
                }
                return next;
            }
        });
    }

    filter(predicate: Predicate<T>): Stream<T> {
        this.checkClosed();
        const it = this.src;
        const filterOp: Iterator<T> = {
            next: () => {
                let next: IteratorResult<T>;
                do {
                    next = it.next();
                } while (!next.done && !predicate(next.value));
                return { done: !next.value, value: next.value };
            }
        };

        return new Stream(filterOp);
    }

    map<R>(mapper: (item: T) => R): Stream<R> {
        this.checkClosed();
        const it = this.src;

        const mapOp: Iterator<R> = {
            next: () => {
                const next = it.next();
                return { done: next.done, value: next.value ? mapper(next.value) : undefined };
            }
        };

        return new Stream(mapOp);
    }

    flatMap<R>(mapper: (item: T) => Stream<R>): Stream<R> {
        this.checkClosed();
        let streamOfStreams = this.map(mapper);
        let itOfStreams = streamOfStreams.src;
        let currentStream: IteratorResult<Stream<R>>;
        let flatOp: Iterator<R> = {
            next: () => {
                if (!currentStream) {
                    currentStream = itOfStreams.next();
                }
                while (true) {
                    if (currentStream.done) {
                        return { done: true, value: undefined };
                    }
                    let nextR: IteratorResult<R> = currentStream.value.src.next();
                    if (!nextR.done) {
                        return { done: false, value: nextR.value };
                    }
                    if (nextR.done && currentStream.done) {
                        return nextR;
                    }
                    if (nextR.done && !currentStream.done) {
                        currentStream = itOfStreams.next();
                    }
                }

            }
        };
        return new Stream(flatOp);
    }


    reduce(reducer: (a: T, b: T) => T, identity?: T) {
        this.checkClosed(true);
        let elements = this.collect(Stream.toArray());
        let result = identity;
        for (let element of elements) {
            result = reducer(result, element);
        }
        return result;
    }

    find(predicate: Predicate<T>) {
        this.checkClosed(true);
        let next;
        do {
            next = this.src.next();
        } while (!next.done && !predicate(next.value));
        return next.value;
    }

    peek(op: (item: T) => void): Stream<T> {
        return new Stream({
            next: () => {
                let next = this.src.next();
                if (!next.done) {
                    op(next.value);
                }
                return next;
            }
        });
    }

    skip(n: number): Stream<T> {
        let skipped = 0;
        return new Stream({
            next: () => {
                while(skipped < n){
                    this.src.next();
                    skipped++;
                }
                return this.src.next();
            }
        });
    }

    limit(n: number): Stream<T> {
        let processed = 0;
        return new Stream({
            next: () => {
                if(processed >= n){
                    return {done: true, value: undefined};
                }
                processed++;
                return this.src.next();
            }
        });
    }

    count(): number {
        this.checkClosed(true);
        let i = 0;
        for (let el of this.toIterable()) {
            i++;
        }
        return i;
    }

    anyMatch(predicate: Predicate<T>) {
        this.checkClosed(true);
        for (let item of this.toIterable()) {
            if (predicate(item)) {
                return true;
            }
        }
        return false;
    }

    allMatch(predicate: Predicate<T>) {
        this.checkClosed(true);
        for (let item of this.toIterable()) {
            if (!predicate(item)) {
                return false;
            }
        }
        return true;

    }
    noneMatch(predicate: Predicate<T>) {
        this.checkClosed(true);
        for (let item of this.toIterable()) {
            if (predicate(item)) {
                return false;
            }
        }
        return true;
    }

    forEach(action: (item: T) => void) {
        this.checkClosed(true);
        for (let item of this.toIterable()) {
            action(item);
        }
    }

    collect<R>(collector: Collector<T, R[]>) {
        this.checkClosed(true);
        return collector(this.toIterable());
    }

    checkClosed(set?: boolean) {
        if (this.closed) {
            throw new Error('Stream has already been consumed');
        }
        if (set) {
            this.closed = true;
        }
    }

    private toIterable() {
        return {
            [Symbol.iterator]: () => this.src
        };
    }


}