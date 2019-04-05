# Downstream.js

Downstream.js is a JavaScript implementation of [Java 8 Streams](https://docs.oracle.com/javase/8/docs/api/?java/util/stream/Stream.html)

# Example

```typescript

import { Downstream, Collectors } from 'downstream';

const result = Downstream.of([//create a stream from multiple array sources
    [1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20]
])
    .flatMap(arr => Downstream.of(arr))//flat map into a single stream of numbers
    .filter(n => n % 2 === 0)//only allow even numbers
    .peek(console.log)//look at each element of the stream
    .collect(Collectors.toArray());//collect into an array

console.log(result);//Logs even numbers from the stream: [2, 4, 6, 8, ... , 18, 20]

```