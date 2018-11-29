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

export class Promise<R> implements Thenable<R> {
  /**
   * 在构造函数中调用 resolve ，则 promise 的状态会变为 fulfilled
   * 在构造函数中调用 reject ，则 promise 的状态会变为 rejected
   */
  constructor(
    callback: (
      resolve: (value?: R | Thenable<R>) => void,
      reject: (error?: any) => void
    ) => void
  );

  /**
   * 当 promise 处于 fulfilled 状态，会调用 onFulfilled
   * 当 promise 处于 rejected 状态，会调用 onRejected
   *
   * @param onFulfilled called when/if "promise" resolves
   * @param onRejected called when/if "promise" rejects
   */
  then<U>(
    onFulfilled?: (value: R) => U | Thenable<U>,
    onRejected?: (error: any) => U | Thenable<U>
  ): Promise<U>;
  then<U>(
    onFulfilled?: (value: R) => U | Thenable<U>,
    onRejected?: (error: any) => void
  ): Promise<U>;

  /**
   * promise.then(undefined, onRejected) 的语法糖
   *
   * @param onRejected called when/if "promise" rejects
   */
  catch<U>(onRejected?: (error: any) => U | Thenable<U>): Promise<U>;

  /**
   * 当 promise 处于稳定状态时( fulfilled 或 rejected )调用回调
   *
   * @param onFinally called when/if "promise" settles
   */
  finally<U>(onFinally?: (callback: any) => U | Thenable<U>): Promise<U>;

  /**
   * 创建一个 thenable 的 promise
   * thenable 是一个具备 then 方法的伪 promise
   */
  static resolve(): Promise<void>;
  static resolve<R>(value: R | Thenable<R>): Promise<R>;

  /**
   * 返回一个处于 rejected 状态的 promise ( 为了方便调试，建议传入的对象为 Error 的实例 )
   */
  static reject<R>(error: any): Promise<R>;

  /**
   * 当传入的所有 promise 都 resolve 时，返回一个由这些 resolve 的值组成的数组的 promise
   * 当传入 promise 中任何一个 reject 则返回新的带该 reject 值的 promise
   */
  static all<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(
    values: [
      T1 | Thenable<T1>,
      T2 | Thenable<T2>,
      T3 | Thenable<T3>,
      T4 | Thenable<T4>,
      T5 | Thenable<T5>,
      T6 | Thenable<T6>,
      T7 | Thenable<T7>,
      T8 | Thenable<T8>,
      T9 | Thenable<T9>,
      T10 | Thenable<T10>
    ]
  ): Promise<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>;
  static all<T1, T2, T3, T4, T5, T6, T7, T8, T9>(
    values: [
      T1 | Thenable<T1>,
      T2 | Thenable<T2>,
      T3 | Thenable<T3>,
      T4 | Thenable<T4>,
      T5 | Thenable<T5>,
      T6 | Thenable<T6>,
      T7 | Thenable<T7>,
      T8 | Thenable<T8>,
      T9 | Thenable<T9>
    ]
  ): Promise<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>;
  static all<T1, T2, T3, T4, T5, T6, T7, T8>(
    values: [
      T1 | Thenable<T1>,
      T2 | Thenable<T2>,
      T3 | Thenable<T3>,
      T4 | Thenable<T4>,
      T5 | Thenable<T5>,
      T6 | Thenable<T6>,
      T7 | Thenable<T7>,
      T8 | Thenable<T8>
    ]
  ): Promise<[T1, T2, T3, T4, T5, T6, T7, T8]>;
  static all<T1, T2, T3, T4, T5, T6, T7>(
    values: [
      T1 | Thenable<T1>,
      T2 | Thenable<T2>,
      T3 | Thenable<T3>,
      T4 | Thenable<T4>,
      T5 | Thenable<T5>,
      T6 | Thenable<T6>,
      T7 | Thenable<T7>
    ]
  ): Promise<[T1, T2, T3, T4, T5, T6, T7]>;
  static all<T1, T2, T3, T4, T5, T6>(
    values: [
      T1 | Thenable<T1>,
      T2 | Thenable<T2>,
      T3 | Thenable<T3>,
      T4 | Thenable<T4>,
      T5 | Thenable<T5>,
      T6 | Thenable<T6>
    ]
  ): Promise<[T1, T2, T3, T4, T5, T6]>;
  static all<T1, T2, T3, T4, T5>(
    values: [
      T1 | Thenable<T1>,
      T2 | Thenable<T2>,
      T3 | Thenable<T3>,
      T4 | Thenable<T4>,
      T5 | Thenable<T5>
    ]
  ): Promise<[T1, T2, T3, T4, T5]>;
  static all<T1, T2, T3, T4>(
    values: [
      T1 | Thenable<T1>,
      T2 | Thenable<T2>,
      T3 | Thenable<T3>,
      T4 | Thenable<T4>
    ]
  ): Promise<[T1, T2, T3, T4]>;
  static all<T1, T2, T3>(
    values: [T1 | Thenable<T1>, T2 | Thenable<T2>, T3 | Thenable<T3>]
  ): Promise<[T1, T2, T3]>;
  static all<T1, T2>(
    values: [T1 | Thenable<T1>, T2 | Thenable<T2>]
  ): Promise<[T1, T2]>;
  static all<T1>(values: [T1 | Thenable<T1>]): Promise<[T1]>;
  static all<TAll>(values: Array<TAll | Thenable<TAll>>): Promise<TAll[]>;

  /**
   * 只要传入的 promise 任何一个 fulfills 或 rejects，都将返回对应状态
   */
  static race<R>(promises: (R | Thenable<R>)[]): Promise<R>;
}
