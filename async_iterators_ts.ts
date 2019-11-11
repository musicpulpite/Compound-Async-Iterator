import { Promise } from 'es6-promise';

interface IteratorResult<T> {
  done: boolean;
  value: T;
}

interface AsyncIterator<T> {
  next(value?: any): Promise<IteratorResult<T>>;
  return?(value?: any): Promise<IteratorResult<T>>;
  throw?(e?: any): Promise<IteratorResult<T>>;
}

function asyncIterator_ts(resource: String, limit: Number = 10 ): AsyncIterator<Object>  {
    let id = 1;
    return {
      next: () => new Promise<IteratorResult<Object>>(function(resolve, reject) {
        setTimeout(() => {
          fetch(`${resource}${id}`)
            .then(response => response.json())
            .then(json => {
              if (id <= limit) {
                id++;
                resolve({
                  value: json,
                  done: false
                })
              } else {
                resolve({
                  value: undefined,
                  done: true
                })
              }
            })
            .catch(error => reject(error));
        }, Math.random() * 5000);
      })
    }
};

function compoundAsyncIterator_ts(asyncIterators: AsyncIterator<Object>[], iteratorCallbacks: Function[]): AsyncIterator<Object> {
    let doneCount = 0;
    
    const iteratorMapper = (iterator: AsyncIterator<Object>, idx: number) => 
      iterator.next()
      .then(resolvedValue => {
        const callback = iteratorCallbacks[idx];
        if (callback && typeof callback === 'function') {
          callback(resolvedValue);
        }
        return { idx, resolvedValue };
      })
    let iteratorPromises = asyncIterators.map(iteratorMapper);
  
    const iteratorRace = (resolve, reject) => Promise.race(iteratorPromises)
    .then(({ idx, resolvedValue }) => {
      if (!resolvedValue.done) {
        iteratorPromises[idx] = iteratorMapper(asyncIterators[idx], idx);
        resolve(resolvedValue);
      } else {
        doneCount++;
        if (doneCount === asyncIterators.length) {
          resolve({ value: undefined, done: true });
        } else {
          iteratorPromises[idx] = new Promise((resolve, reject) => {});
          return iteratorRace(resolve, reject)
        }
      }
    })
    .catch(error => reject(error))
  
    return {
      next: () => new Promise<IteratorResult<Object>>((resolve, reject) => {
        return iteratorRace(resolve, reject);
      })
    }
  };