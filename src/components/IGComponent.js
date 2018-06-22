import { Component } from 'react'

// Keeps track of a group of promises that should
// be run in series. Each promise has an associated key
// so that the group can be compared to another promise
// group to determine if the results will be the same.
class PromiseMonitor {
  constructor(promises, cache) {
    this.promises = promises
    this.cache = cache || []
  }

  // Compare the key of each promise being monitored
  // with the new promises to see if there's a difference
  sameAs(newPromises) {
    if (this.promises.length !== newPromises.length) return false

    for (let i = 0; i < newPromises.length; i++) {
      const promiseKey = this.promises[i][1]
      const newPromisesKey = newPromises[i][1]
      if (promiseKey !== newPromisesKey) {
        return false
      }
    }

    return true
  }

  cancel() {
    this.running = false
  }

  run() {
    if (!this.promises.length) return

    this.running = true

    const next = (i, prevVal) => {
      if (i >= this.promises.length) return

      const promise = this.promises[i]
      const [fn, key] = promise
      const cacheable = promise[2] === undefined || promise[2] === true
      if (cacheable && key && (this.cache[i] || {}).key === key && (this.cache[i] || {}).complete) {
        return next(i + 1, this.cache[i].value)
      }

      if (cacheable) {
        this.cache[i] = {
          complete: false,
          key
        }
      }

      const res = fn(prevVal)
      const onComplete = val => {
        if (!this.running) return

        if (cacheable) {
          this.cache[i].value = val
          this.cache[i].complete = true
        }

        return next(i + 1, val)
      }
      if (res instanceof Promise) {
        res.then(onComplete)
      } else {
        onComplete(res)
      }
    }
    return next(0)
  }
}

class IGComponent extends Component {
  // promises is an array of
  // [<function returning a promise>, key, cacheable]
  // On repeated calls to this function, if the same
  // key is at the same index, the same result will be
  // returned from an internal cache, unless cacheable
  // is false
  triggerPromises(promises) {
    // Ignore repeated calls with the same parameters
    if (this.runningPromises && this.runningPromises.sameAs(promises)) return

    this.runningPromises && this.runningPromises.cancel()
    this.runningPromises = new PromiseMonitor(promises, (this.runningPromises || {}).cache)
    this.runningPromises.run()
  }

  componentWillUnmount() {
    this.runningPromises && this.runningPromises.cancel()
  }
}

export default IGComponent
