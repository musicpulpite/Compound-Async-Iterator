# Compound Async Iterator
This mini-project contains an async iterator function that composes several individual async iterator objects
into a single async iterator object that returns the resolved values from each async iterator in the order that
they resolve. So for example, if given two async iterator objects (iterator A, iterator B), repeatedly calling `next` on the compound async iterator object may result in a sequence like this: 

```
    A.1
    B.1
    A.2
    B.2
    A.3
    B.3
    ...
```

or

```
    A.1
    A.2
    B.1
    A.3
    B.2
    B.3
    ...
```

depending on the relative order in which each resource returns async values.

### Theory
The key insight here is that since invoking the `next` method for any one async iterator returns a promise for that async resource, we can wrap all of the returned promises from a collection of async iterators inside of `Promise.race(arrayOfPromises)` and reset the array of promises after each resolved promise. If any one resource completes (returning `{ value: undefined, done: true }`) we replace it with a placeholder promise and continue evaluating until all of the wrapped promises have completed. At that point the compound async iterator is considered 'done'.

### Bonus
For sake of completeness the `compoundAsyncIterator` function also accepts an array of callbacks corresponding to each async iterator parameter. If present, the corresponding callback function will be invoked for each resolved value of a particular async iterator (performing any special logic unique to that async resource) before it is returned to the compound async iterator.