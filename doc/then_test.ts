
// 通过改变 isResolve 来切换 promise1 的状态 
const isResolve = true;

const promise1 = new Promise((resolve, reject) => {
  if (isResolve) {
    resolve('promise1 执行态')
  }else{
    reject('promise1 拒绝态')
  }
});

// 一、promise1 处于 resolve 以及 onFulfilled 抛出异常 的情况
// promise2 必须拒绝执行，并返回拒因
promise1.then(()=>{
    throw "抛出异常!";
}).then((value)=>{
    console.log(value)
},(reason)=>{
    console.log(reason)
})

// 二、promise1 处于 resolve 以及 onFulfilled 不是函数的情况
// promise2 必须成功执行并返回相同的值
promise1.then().then((value)=>{
    console.log(value)
})

// 三、promise1 处于 reject 以及 onRejected 不是函数的情况
// promise2 必须拒绝执行并返回拒因
promise1.then().then(()=>{},(reason)=>{
    console.log(reason)
})


// 四、promise1 处于 resolve 以及 onFulfilled 有返回值时
promise1.then((value)=>{
    return value
}).then((value)=>{
    console.log(value)
})
