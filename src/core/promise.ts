import { needsNew, needsResolver } from '../utils/error';

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

export default class Promise<R> implements Thenable<R> {
  private ['[[PromiseStatus]]']: PromiseStatus = 'pending';
  private ['[[PromiseValue]]']: any = undefined;

  constructor(resolver: Resolver<R>) {
    typeof resolver !== 'function' && needsResolver();
    this instanceof Promise ? this.init(resolver) : needsNew();
  }
  init(resolver: Resolver<R>) {
    return null;
  }
  then(onFulfilled, onRejected) {
    return null;
  }
  catch(onRejection) {
    return this.then(null, onRejection);
  }
  finally(callback) {
    return this.then(callback, callback);
  }

  static resolve(object) {
    return null;
  }
  static reject(reason) {
    return null;
  }
  static all() {
    return null;
  }
  static race() {
    return null;
  }
}
