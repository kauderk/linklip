export function createTask<T>() {
  let resolve = (v: T) => {},
    reject = () => {}

  const promise = new Promise<T>(function (_resolve, _reject) {
    // @ts-ignore
    resolve = _resolve
    reject = _reject
  })
  return { resolve, reject, promise }
}
