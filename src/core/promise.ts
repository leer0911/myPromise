import {
  constructorError,
  resolverError,
  resolveSelfError,
  cannotReturnOwn
} from '../utils/error';
import { isObjectORFunction, isFunction } from '../utils/is';
import { TRY_CATCH_ERROR, PROMISE_STATUS, PROMISE_ID } from './const';
export interface Thenable<R> {
  then<U>(
    onFulfilled?: (value: R) => U | Thenable<U>,
    onRejected?: (error: any) => U | Thenable<U>
  ): Thenable<U>;
  then<U>(
    onFulfilled?: (value: R) => U | Thenable<U>,
    onRejected?: (error: any) => void
  ): Thenable<U>;
}

export interface Resolve<R> {
  (value?: R | Thenable<R>): void;
}

export interface Reject {
  (error?: any): void;
}

export interface Resolver<R> {
  (resolve: Resolve<R>, reject: Reject): void;
}

type PromiseStatus = 'pending' | 'fulfilled' | 'rejected';

let id = 0;
export default class Promise<R> implements Thenable<R> {
  private ['[[PromiseStatus]]']: PromiseStatus = 'pending';
  private ['[[PromiseValue]]']: any = undefined;
  subscribes: any[] = [];

  constructor(resolver: Resolver<R>) {
    this[PROMISE_ID] = id++;

    // resolver 必须为函数
    typeof resolver !== 'function' && resolverError();
    // 使用 Promise，需要用 new 操作符
    this instanceof Promise ? this.init(resolver) : constructorError();
  }

  private init(resolver: Resolver<R>) {
    try {
      resolver(
        value => {
          this.mockResolve(value);
        },
        reason => {
          this.mockReject(reason);
        }
      );
    } catch (e) {
      this.mockReject(e);
    }
    return null;
  }
  private isThenable(value: any, then: any) {
    const sameConstructor = value.constructor === this.constructor;
    const sameThen = then === this.then;
    const sameResolve = value.constructor.resolve === Promise.resolve;
    return sameConstructor && sameThen && sameResolve;
  }
  private subscribe(parent, child, onFulfillment, onRejection) {
    let {
      subscribes,
      subscribes: { length }
    } = parent;
    subscribes[length] = child;
    subscribes[length + PROMISE_STATUS.fulfilled] = onFulfillment;
    subscribes[length + PROMISE_STATUS.rejected] = onRejection;
    if (length === 0 && PROMISE_STATUS[parent['[[PromiseStatus]]']]) {
      this.asap(this.publish);
    }
  }
  private asap(callback) {
    setTimeout(() => {
      callback.call(this);
    }, 1);
  }
  private publish() {
    const subscribes = this.subscribes;
    const state = this['[[PromiseStatus]]'];
    const settled = PROMISE_STATUS[state];
    const result = this['[[PromiseValue]]'];
    if (subscribes.length === 0) {
      return;
    }
    for (let i = 0; i < subscribes.length; i += 3) {
      const item = subscribes[i];
      const callback = subscribes[i + settled];
      if (item) {
        this.invokeCallback(state, item, callback, result);
      } else {
        callback(result);
      }
    }
    this.subscribes.length = 0;
  }
  private tryCatch(callback, detail) {
    try {
      return callback(detail);
    } catch (e) {
      TRY_CATCH_ERROR.error = e;
      return TRY_CATCH_ERROR;
    }
  }
  private invokeCallback(settled, child, callback, detail) {
    const hasCallback = isFunction(callback);
    let value, error, succeeded, failed;
    if (hasCallback) {
      value = this.tryCatch(callback, detail);
      if (value === TRY_CATCH_ERROR) {
        failed = true;
        error = value.error;
        value.error = null;
      } else {
        succeeded = true;
      }

      if (child === value) {
        this.mockReject.call(child, cannotReturnOwn());
        return;
      }
    } else {
      value = detail;
      succeeded = true;
    }

    if (child['[[PromiseStatus]]'] !== 'pending') {
      return;
    }

    if (hasCallback && succeeded) {
      this.mockResolve.call(child, value);
      return;
    }

    if (failed) {
      this.mockReject.call(child, error);
      return;
    }

    if (settled === 'fulfilled') {
      this.fulfill.call(child, value);
      return;
    }

    if (settled === 'rejected') {
      this.mockReject.call(child, value);
      return;
    }
  }
  private handleOwnThenable(thenable: any) {
    // 处理 value 为 promise 对象的情况

    const state = thenable['[[PromiseStatus]]'];
    const result = thenable['[[PromiseValue]]'];

    if (state === 'fulfilled') {
      this.fulfill(result);
      return;
    }
    if (state === 'rejected') {
      this.mockReject(result);
      return;
    }
    this.subscribe(
      thenable,
      undefined,
      value => this.mockResolve(value),
      reason => this.mockReject(reason)
    );
  }
  private tryThen(then, thenable, resolvePromise, rejectPromise) {
    try {
      then.call(thenable, resolvePromise, rejectPromise);
    } catch (e) {
      return e;
    }
  }
  private handleForeignThenable(thenable: any, then: any) {
    this.asap(() => {
      // 如果 resolvePromise 和 rejectPromise 均被调用，
      // 或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
      // 此处 sealed (稳定否)，用于处理上诉逻辑
      let sealed = false;
      const error = this.tryThen(
        then,
        thenable,
        value => {
          if (sealed) {
            return;
          }
          sealed = true;
          if (thenable !== value) {
            this.mockResolve(value);
          } else {
            this.fulfill(value);
          }
        },
        reason => {
          if (sealed) {
            return;
          }
          sealed = true;
          this.mockReject(reason);
        }
      );

      if (!sealed && error) {
        sealed = true;
        this.mockReject(error);
      }
    });
  }
  private handleLikeThenable(value: any, then: any) {
    // 处理 "真实" promise 对象
    if (this.isThenable(value, then)) {
      this.handleOwnThenable(value);
      return;
    }
    // 获取 then 值失败且抛出异常，则以此异常为拒因 reject promise
    if (then === TRY_CATCH_ERROR) {
      this.mockReject(TRY_CATCH_ERROR.error);
      TRY_CATCH_ERROR.error = null;
      return;
    }
    // 如果 then 是函数，则检验 then 方法的合法性
    if (isFunction(then)) {
      this.handleForeignThenable(value, then);
      return;
    }
    // 非 Thenable ，则将该终植直接交由 fulfill 处理
    this.fulfill(value);
  }
  private fulfill(value: any) {
    this['[[PromiseStatus]]'] = 'fulfilled';
    this['[[PromiseValue]]'] = value;

    // 用于处理异步情况
    if (this.subscribes.length !== 0) {
      this.asap(this.publish);
    }
  }
  private getThen(value: any) {
    try {
      return value.then;
    } catch (error) {
      TRY_CATCH_ERROR.error = error;
      return TRY_CATCH_ERROR;
    }
  }
  private mockResolve(value: any) {
    // resolve 不能传入当前 then 返回的 Promise 对象，否则会报 TypeError
    if (value === this) {
      this.mockReject(resolveSelfError);
      return;
    }
    // 处理 value 为其他有效 JavaScript 的情况
    if (!isObjectORFunction(value)) {
      this.fulfill(value);
      return;
    }
    // 处理 value 为 Thenable 的情况
    this.handleLikeThenable(value, this.getThen(value));
  }
  private mockReject(reason: any) {
    this['[[PromiseStatus]]'] = 'rejected';
    this['[[PromiseValue]]'] = reason;
    this.asap(this.publish);
  }

  then(onFulfilled?, onRejected?) {
    const parent: any = this;
    const child = new parent.constructor(() => {});

    // promise 各状态对应枚举值 'pending' 对应 0 ，'fulfilled' 对应 1，'rejected' 对应 2
    const state = PROMISE_STATUS[this['[[PromiseStatus]]']];
    debugger
    if (state) {
      const callback = arguments[state - 1];
      this.asap(() =>
        this.invokeCallback(
          this['[[PromiseStatus]]'],
          child,
          callback,
          this['[[PromiseValue]]']
        )
      );
    } else {
      // 调用 then方法 的 promise 处于 pending 状态的处理逻辑，一般为异步情况。
      this.subscribe(parent, child, onFulfilled, onRejected);
    }
    return child;
  }
  catch(onRejection) {
    return this.then(null, onRejection);
  }
  finally(callback) {
    return this.then(callback, callback);
  }

  static resolve(object: any) {
    let Constructor = this;
    if (
      object &&
      typeof object === 'object' &&
      object.constructor === Constructor
    ) {
      return object;
    }
    let promise = new Constructor(() => {});
    promise.mockResolve(object);
    return promise;
  }
  static reject(reason: any) {
    let Constructor = this;
    let promise = new Constructor(() => {});
    promise.mockReject(reason);
    return promise;
  }
  static all(entries: any[]) {
    let result = [];
    let num = 0;
    if (!Array.isArray(entries)) {
      return new this((_, reject) =>
        reject(new TypeError('You must pass an array to all.'))
      );
    } else {
      if (entries.length === 0) {
        return new this(resolve => resolve([]));
      }
      return new this((resolve, reject) => {
        entries.forEach(item => {
          this.resolve(item).then(data => {
            result.push(data);
            num++;
            if (num === entries.length) {
              resolve(result);
            }
          }, reject);
        });
      });
    }
  }
  static race(entries: any[]) {
    if (!Array.isArray(entries)) {
      return new this((_, reject) =>
        reject(new TypeError('You must pass an array to race.'))
      );
    } else {
      return new this((resolve, reject) => {
        let length = entries.length;
        for (let i = 0; i < length; i++) {
          this.resolve(entries[i]).then(resolve, reject);
        }
      });
    }
  }
}
