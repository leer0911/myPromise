const TRY_CATCH_ERROR = { error: null };

const PROMISE_STATUS = {
  pending: 0,
  fulfilled: 1,
  rejected: 2
};

const PROMISE_ID = Math.random()
  .toString(36)
  .substring(2);

export { TRY_CATCH_ERROR, PROMISE_STATUS, PROMISE_ID };
