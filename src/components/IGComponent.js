import { Component } from 'react'
import Fetcher from '../lib/Fetcher'

// Keeps track of a group of promises that should
// be run in series. Each promise has an associated key
// so that the group can be compared to another promise
// group to determine if the results will be the same.
class PromiseMonitor {
  constructor(component, promises, cache) {
    this.component = component
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
      if (promiseKey === false || newPromisesKey === false || promiseKey !== newPromisesKey) {
        return false
      }
    }

    return true
  }

  cancel() {
    this.running = false
    for (const p of this.promises) {
      if (p instanceof Fetcher) {
        p.cancel()
      }
    }
  }

  run() {
    if (!this.promises.length) return

    this.running = true

    const next = (i, prevVal) => {
      if (i >= this.promises.length) return

      const promise = this.promises[i]
      const [fn, key, cb] = promise
      const cacheable = key !== false
      if (cacheable && key && (this.cache[i] || {}).key === key && (this.cache[i] || {}).complete) {
        // Found the result in the cache, move on to the next promise
        return setTimeout(() => next(i + 1, this.cache[i].value), 0)
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

        // If a callback was provided
        if (cb) {
          // If the callback is a string, just call setState() on
          // the component with that string as the variable name
          if (typeof cb === 'string') {
            this.component.setState({[cb]: val})
          } else {
            // Otherwise call the callback
            cb(val)
          }
        }

        return next(i + 1, val)
      }
      if (res instanceof Promise) {
        res.then(onComplete)
      } else {
        setTimeout(() => onComplete(res), 0)
      }
    }
    return next(0)
  }
}

//
// IGComponent helps with rendering Components that need to respond to
// changes in the URL.
// The triggerPromises() method allows a sub-class to provide a list of
// Promises / Fetchers to be called when the URL changes, and optionally
// cache the value so that URL changes don't cause re-fetches.
// Note that the cache does not persist after the component is unmounted.
//
class IGComponent extends Component {
  // promises is an array of
  // [<function returning a Promise / Fetcher>, key, callback]
  // - callback is called if the Promise / Fetcher completes successfully.
  //   If callback is a string, then setState() is called with the string
  //   as the variable name and the promise result as the value
  //   eg setState({ 'repo': value })
  // - On repeated calls to this function, if the same key is at the same
  //   index, the same result will be returned from an internal cache,
  //   unless key is false
  // Example:
  // [() => GitRepo.fetch(this.repoCid), this.repoCid, 'repo']
  triggerPromises(promises) {
    // Ignore repeated calls with the same parameters
    if (this.runningPromises && this.runningPromises.sameAs(promises)) return

    this.runningPromises && this.runningPromises.cancel()
    this.runningPromises = new PromiseMonitor(this, promises, (this.runningPromises || {}).cache)
    this.runningPromises.run()
  }

  componentWillUnmount() {
    this.runningPromises && this.runningPromises.cancel()
  }

  componentDidMount() {
    this.handlePathChange()
  }

  componentDidUpdate() {
    this.handlePathChange()
  }

  handlePathChange() {
    if (!(this.props || {}).location) return

    const urlPath = this.props.location.pathname
    if (this.urlPath !== urlPath) {
      this.pathDidChange(urlPath)
    }
    this.urlPath = urlPath
  }

  // Override in subclass
  pathDidChange(urlPath) {
  }
}

export default IGComponent
