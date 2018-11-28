const queue = new Array(1000);
const browserWindow = typeof window !== 'undefined' ? window : undefined;
const browserGlobal: any = browserWindow || {};
const BrowserMutationObserver = browserGlobal.MutationObserver;
const flush = () => {
  for (let i = 0; i < len; i += 2) {
    let callback = queue[i];
    let arg = queue[i + 1];

    callback(arg);

    queue[i] = undefined;
    queue[i + 1] = undefined;
  }

  len = 0;
};
const useMutationObserver = () => {
  let iterations = 0;
  const observer = new BrowserMutationObserver(flush);
  const node = document.createTextNode('');
  observer.observe(node, { characterData: true });
  return () => {
    node.data = String((iterations = ++iterations % 2));
  };
};
const useSetTimeout = () => {
  const globalSetTimeout = setTimeout;
  return () => globalSetTimeout(flush, 1);
};

let len = 0;
const asap = (callback, arg?) => {
  let scheduleFlush;
  if (BrowserMutationObserver) {
    scheduleFlush = useMutationObserver();
  } else {
    scheduleFlush = useSetTimeout();
  }
  queue[len] = callback;
  queue[len + 1] = arg;
  len += 2;
  if (len === 2) {
    scheduleFlush();
  }
};

export default asap;
