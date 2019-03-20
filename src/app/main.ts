import { Stream } from './stream';

const result = Stream.of([
    [1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20]
])
    .flatMap(arr => Stream.of(arr))
    .limit(5)
    .peek(console.log)
    .collect(Stream.toArray());

///console.log(result);

// const map = Stream.of(new Map([['one', 'two']]))
//     .flatMap(Stream.of)
//     .collect(Stream.toArray());

//console.log(map);