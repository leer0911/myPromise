import Promise from './core/promise';

const promise = new Promise((resolve, reject) => {
  resolve('{ a: 1 }');
});

promise.then(data => {
  console.log(data);
});

export default Promise;
