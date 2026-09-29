// Firestore applies a write to its local cache straight away, but the promise
// only settles once the server confirms it, which never happens offline. So
// offline, report the write as done once it's queued (the screens already show
// it from the cache) instead of spinning until the connection returns.
const settle = <T>(write: Promise<T>, whenQueued: T): Promise<T> => {
  if (navigator.onLine) return write;
  // eslint-disable-next-line no-console
  write.catch((error) => console.error("Queued write failed", error));
  return Promise.resolve(whenQueued);
};

export default settle;
