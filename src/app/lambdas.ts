export interface Predicate<T> {
    (item: T): boolean
}

export interface Comparator<T> {
    (a: T, b: T): -1 | 0 | 1
}

export interface Mapper<T, R> {
    (item: T): R
}

export interface Peeker<T> {
    (item: T): void
}