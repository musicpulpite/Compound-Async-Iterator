/**
 * A somewhat contrived async iterator wrapping a standard fetch call to an
 * API testing website (jsonplaceholder.typicode.com)
 * 
 * @param {string} resource - URL of fetchable resource
 * @param {number} limit - Number of resources to return before this iterator is considered 'done'
 * @returns {object} Iterator object with next method
 */
const asyncIterator = function (resource, limit = 10 ) {
  let id = 1;
  return {
    next: () => new Promise(function(resolve, reject) {
      setTimeout(() => {
        fetch(resource + id)
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

// The core function: composes an array of async iterators (like the contrived ones above) into a single
// async iterator that will return the iterated values from each resource in the order that they resolve.
/**
 * The core function: composes an array of async iterators (like the contrived ones above) into a single
 * async iterator that will return the iterated values from each resource in the order that they resolve.
 * 
 * @param {array} asyncIterators - Array of async iterators
 * @param {array} iteratorCallbacks - Array of optional callbacks corresponding to each async iterator
 * @returns {object} Compound iterator object with next method
 */
const compoundAsyncIterator = function(asyncIterators = [], iteratorCallbacks = []) {
  let doneCount = 0;
  
  const iteratorMapper = (iterator, idx) => 
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
    next: () => new Promise((resolve, reject) => {
      return iteratorRace(resolve, reject);
    })
  }
};

const compoundIteratorExample = async () => {
  const resultsList = document.querySelector('#results-list');

  const asyncIteratorsArray = [
    asyncIterator('https://jsonplaceholder.typicode.com/todos/', limit = 5),
    asyncIterator('https://jsonplaceholder.typicode.com/posts/', limit = 2),
  ];

  const iterator = compoundAsyncIterator(asyncIteratorsArray, );
  let result = await iterator.next();

  while(!result.done) {
    console.log(result.value);

    // Display on page
    const li = document.createElement('li');
    li.innerHTML = `${JSON.stringify(result.value, null, 2)}`;
    resultsList.appendChild(li);

    result = await iterator.next();
  };

  const li = document.createElement('li');
  li.innerHTML = '<b>All Done!!</b>';
  resultsList.appendChild(li);

  console.log('All Done!!')
};

// compoundIteratorExample();

document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('#async-button');
  button.addEventListener('click', compoundIteratorExample);
});