const isObject = (val: any) => {
  return val !== null && typeof val === 'object';
};

const isFunction = (val: any) => {
  return toString.call(val) === '[object Function]';
};

const isObjectORFunction = (val: any) => {
  return isFunction(val) || isObject(val);
};

export { isFunction, isObject, isObjectORFunction };
