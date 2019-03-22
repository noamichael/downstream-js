export interface Predicate<T> {
    (item: T): boolean
}

export interface Comparator<T> {
    (a: T, b: T): -1 | 0 | 1
}

export interface Supplier<T> {
    (): T
}

export interface Mapper<T, R> {
    (item: T): R
}

export interface Consumer<T> {
    (item: T): void
}

export interface Reducer<T> {
    (a: T, b: T): T
}