import Promise from './core/promise';

const promise = new Promise((resolve, reject) => {
  resolve(this);
});

const child = promise.then(data => {
  console.log(data);
  return data;
});

child.then(data => {
  console.log(data);
});

export default Promise;
