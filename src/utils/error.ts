const constructorError = () => {
  throw new TypeError(
    "Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function."
  );
};

const resolverError = () => {
  throw new TypeError(
    'You must pass a resolver function as the first argument to the promise constructor'
  );
};

const resolveSelfError = () => {
  return new TypeError('You cannot resolve a promise with itself');
};

const cannotReturnOwn = () => {
  return new TypeError('A promises callback cannot return that same promise.');
};

const validationError = () => {
  return new Error('Array Methods must be provided an Array');
};

export {
  constructorError,
  resolverError,
  resolveSelfError,
  cannotReturnOwn,
  validationError
};
