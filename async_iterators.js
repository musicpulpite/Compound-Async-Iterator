const asyncIteratable = function (resource) {
  return {
    [Symbol.asyncIterator]: async function* asyncGenerator() {
      let i = 1;

      while (i < 10) {
        const resourceAtId = `${resource}${i}`;

        const response = await fetch(resourceAtId);
        const json = await response.json();

        yield { resource: resourceAtId, json };

        i++;
      }
    }
  }
};

const compundAsyncIterable = {
  [Symbol.asyncIterator]: async function* compoundAsyncGenerator() {
    const resourceIds = [1, 1, 1, 1];
    const asyncResources = [
      'https://jsonplaceholder.typicode.com/todos/',
      'https://jsonplaceholder.typicode.com/posts/',
      'https://jsonplaceholder.typicode.com/comments/',
      'https://jsonplaceholder.typicode.com/albums/'
    ];
    asyncResourceMapper = (resource, idx) => new Promise(function(resolve, reject) {
      setTimeout(() => {
        fetch(resource + resourceIds[idx])
          .then(response => response.json())
          .then(json => resolve({ idx, json }))
          .catch(error => reject(error));
      }, Math.random() * 5000);
    });

    const promises = asyncResources.map(asyncResourceMapper);

    while (resourceIds.every(idx => idx < 10)) {
      const { idx, json } = await Promise.race(promises);
      yield { resource: asyncResources[idx] + resourceIds[idx], json };

      resourceIds[idx]++;
      promises[idx] = asyncResourceMapper(asyncResources[idx], idx);
    }
  }
};


async function example() {
  for await ({ resource, json } of asyncIteratable('https://jsonplaceholder.typicode.com/todos/')) {
    console.log(resource, ": ", json);
  }
  for await ({ resource, json } of asyncIteratable('https://jsonplaceholder.typicode.com/posts/')) {
    console.log(resource, ": ", json);
  }
}

const compoundExample = async () => {
  for await ({ resource, json } of compundAsyncIterable) {
    console.log(resource, ": ", json);

    // Display on page
    const resultsList = document.querySelector('#results-list');
    const li = document.createElement('li');
    li.innerHTML = `<b>${resource}</b>: ${JSON.stringify(json, null, 2)}`;
    resultsList.appendChild(li);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('#async-button');
  button.addEventListener('click', compoundExample);
});
// async function compound() {
//   const promises = [fetch('https://jsonplaceholder.typicode.com/todos/1'), fetch('https://jsonplaceholder.typicode.com/posts/1')]

//   Promise.race(promises)
//     .then(response => response.json())
//     .then(json => console.log(json));
// };

// compound();

// async function example(i) {
//   console.log('Requested');
//   const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${i}`);
//   const json = await response.json();
//   console.log(json);
// };

// example(1)