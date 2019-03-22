import { Consumer, Mapper, Supplier, Predicate } from "../lambdas";

export class Optional<T> {

    constructor(
        private value: T
    ) { }

    static empty<T>() {
        return new Optional(null);
    }

    get() {
        if (!this.isPresent()) {
            throw new Error('No value present');
        }
    }

    orElse(value: T) {
        return this.value || value;
    }

    orElseGet(supplier: Supplier<T>) {
        return this.value ? this.value : supplier();
    }

    orElseThrow(supplier: Supplier<Error>) {
        if (this.isPresent()) {
            return this.value;
        }
        throw supplier();
    }

    isPresent() {
        return !!this.value;
    }

    ifPresent(consumer: Consumer<T>) {
        if (this.isPresent()) {
            consumer(this.value);
        }
    }

    map<R>(mapper: Mapper<T, R>): Optional<R> {
        if (this.isPresent()) {
            return new Optional(mapper(this.value));
        }
        return Optional.empty();
    }

    flatMap<R>(mapper: Mapper<T, Optional<R>>): Optional<R> {
        if (this.isPresent()) {
            return mapper(this.value);
        }
        return Optional.empty();
    }

    filter(predicate: Predicate<T>) {
        if(this.isPresent() && predicate(this.value)){
            return this;
        }
        return Optional.empty();
    }

}