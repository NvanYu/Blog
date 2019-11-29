const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";

function resolvePromise(promise2, x, resolve, reject) {
  // x来取决promise2是成功还是失败
  if (x === promise2) {
    return reject(
      new TypeError("TypeError: Chaining cycle detected for promise #<Promise>")
    );
  }
  // 判断x是不是一个promise，如果x是常量，那就直接用这个结果将promise成功掉即可
  let called;
  if ((typeof x === "object" && x !== null) || typeof x === "function") {
    // 有可能是promise
    try {
      let then = x.then; // 取then可能发生异常
      if (typeof then === "function") {
        // 只能认为它是一个promise
        then.call(
          x,
          y => {
            if (called) return; // 调用成功后就不能再调用失败
            called = true;
            // 用刚才取出来的then继续使用，不要再次取then方法了
            resolvePromise(promise2, y, resolve, reject); // 递归解析当前x的promise的返回结果，因为promise成功后返回的还是一个promise
          },
          r => {
            if (called) return;
            called = true;
            reject(r);
          }
        );
      } else {
        // 是对象
        resolve(x); // 普通值
      }
    } catch (e) {
      if (called) return; // 如果调用失败，就把值改为true，如果再次调用，就屏蔽掉他
      called = true;
      reject(e);
    }
  } else {
    // 普通字符串 number bool
    resolve(x);
  }
}

function isPromise(value) {
  if (
    (typeof value === "object" && value !== null) ||
    typeof value === "function"
  ) {
    if (typeof value.then === "function") {
      return true;
    }
  }
  return false;
}

class Promise {
  constructor(executor) {
    this.status = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.resolveCallbacks = [];
    this.rejectCallbacks = [];

    // resolve,reject不能放到原型上是因为原型上的是公用的，而每个promise都有自己的成功和失败，不是公共的
    let resolve = value => {
      // 如果value是一个promise 需要继续解析
      if (value instanceof Promise) {
        // 不能判断有没有then 否则测试过不去
        return value.then(resolve, reject); // 递归
      }
      if (this.status === PENDING) {
        this.status = FULFILLED;
        this.value = value;
        // 如果逻辑是异步的，让订阅数组的成功回调执行
        this.resolveCallbacks.forEach(fn => fn());
      }
    };
    let reject = reason => {
      if (this.status === PENDING) {
        this.status = REJECTED;
        this.reason = reason;
        // 如果逻辑是异步的，让订阅数组的失败回调执行
        this.rejectCallbacks.forEach(fn => fn());
      }
    };

    // 如果executor执行报错时，执行reject
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  // x 是当前then 成功或者失败函数的返回结果
  // x是不是一个普通值，如果是，直接把值传递给下一个then中
  // x是一个promise？需要采用这个x的状态
  // 如果执行出错，直接调用promise2的失败
  then(onfulfilled, onrejected) {
    onfulfilled = typeof onfulfilled === "function" ? onfulfilled : val => val;
    onrejected =
      typeof onrejected === "function"
        ? onrejected
        : err => {
            throw err;
          };
    // promise2 要等待当前这次new的promise执行完后才能获取到,要加setTimeout
    let promise2 = new Promise((resolve, reject) => {
      // 此函数会立即执行
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            let x = onfulfilled(this.value);
            // 看 x 的返回结果，看一下 x 是不是promise，再去让promise2变成成功或失败
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }
      if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onrejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }
      // executor中的逻辑可能是异步的
      // 订阅成功的回调和异步的回调
      if (this.status === PENDING) {
        this.resolveCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onfulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });
        this.rejectCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onrejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          });
        });
      }
    });
    // 每次调用then都要返回一个新的promise,防止状态受影响
    return promise2;
  }

  catch(errCallback) {
    // catch没有终止的功能
    return this.then(null, errCallback);
  }

  static reject(reason) {
    return new Promise((resolve, reject) => {
      reject(reason);
    });
  }

  static resolve(value) {
    return new Promise((resolve, reject) => {
      resolve(value);
    });
  }

  static all(promises) {
    return new Promise((resolve, reject) => {
      let arr = [];
      let index = 0;
      let processData = function(i, y) {
        arr[i] = y;
        if (++index === promises.length) {
          resolve(arr);
        }
      };
      for (var i = 0; i < promises.length; i++) {
        let value = promises[i];
        if (isPromise(value)) {
          value.then(function(y) {
            // i对应的结果就是y
            processData(i, y);
          }, reject);
        } else {
          processData(i, value);
        }
      }
    });
  }

  finally(callback) {
    let p = this.constructor;
    return this.then(
      value => p.resolve(callback()).then(() => value),
      reason =>
        p.resolve(callback()).then(() => {
          throw reason;
        })
    );
  }
}

Promise.defer = Promise.deferred = function() {
  let dfd = {};
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
};

module.exports = Promise;
