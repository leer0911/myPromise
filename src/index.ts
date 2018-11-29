import Promise from './core/promise';
// import { Promise } from 'es6-promise';

// const promise1 = new Promise((resolve, reject) => {
//   setTimeout(() => {
//     reject(1);
//   }, 500);
// });

// Promise.reject('a')
//   .then(data => {
//     console.log(data);
//   })
//   .catch(err => {
//     console.log(err);
//   });

const promise1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(1);
  }, 500);
});

const promise2 = new Promise(resolve => {
  setTimeout(() => {
    resolve(2);
  }, 2000);
});
const promise3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(3);
  }, 1000);
});

Promise.all([promise1, promise2, promise3])
  .then(data => {
    console.log('data', data);
  })
  .catch(reason => {
    console.log(reason);
  });

// const promise1 = new Promise((resolve, reject) => {
//   // reject('error');
//   throw 'err';
// });

// const promise2 = new Promise(resolve => {
//   resolve(promise1);
// });

// promise2
//   .then(data => {
//     console.log(data);
//   })
//   .catch(err => {
//     console.log(err);
//   });

export default Promise;
