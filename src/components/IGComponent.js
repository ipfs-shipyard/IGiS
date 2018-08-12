import { Component } from 'react'
import Fetcher from '../lib/Fetcher'

// Keeps track of a group of promises that should
// be run in series or in parallel. Each promise has an
// associated key for caching and so that the group
// can be compared to another promise group to determine
// if the results will be the same.
class PromiseMonitor {
  constructor(component, promises, cache) {
    this.component = component
    this.promises = promises
    this.cache = cache || (Array.isArray(promises) ? [] : {})
    this.executing = {}
  }

  // Compare the cache keys of each promise being monitored
  // with the new promises to see if there's a difference
  sameAs(newPromises, currentPromises = this.promises) {
    if (Object.keys(currentPromises).length !== Object.keys(newPromises).length) return false
    if (Array.isArray(currentPromises) !== Array.isArray(newPromises)) return false

    // If it's an array
    if (Array.isArray(newPromises)) {
      // Check the type of the first element; if it's a function check the keys match
      if (typeof newPromises[0] === 'function') {
        if (typeof currentPromises[0] !== 'function') return false
        if (!newPromises[1] || !currentPromises[1]) return false
        if (newPromises[1] !== currentPromises[1]) return false
        return true
      }
    }

    // Otherwise, recurse over each element
    for (const k of Object.keys(currentPromises)) {
      if (!this.sameAs(currentPromises[k], newPromises[k])) {
        return false
      }
    }

    return true
  }

  cancel() {
    this.running = false
    for (const e of Object.values(this.executing)) {
      e instanceof Fetcher && e.cancel()
    }
    this.executing = {}
  }

  async run() {
    this.running = true
    const collected = Array.isArray(this.promises) ? [] : {}
    const res = await this.fetchNextLevel(this.promises, undefined, collected, collected, this.cache)
    this.running = false
    return res
  }

  // Work out what kind of level we are processing. A level could be an array, a map
  // or a promise entry (fn, key, cb)
  fetchNextLevel(level, prevVal, collected, collectLevel, cache, cacheIndex) {
    if (!level || !this.running) return

    // It's a promise entry
    const isArray = Array.isArray(level)
    if (isArray && typeof level[0] === 'function') {
      return this.resolvePromiseEntry(level, prevVal, collected, cache, cacheIndex)
    }

    // Otherwise it's an array or object
    if (cacheIndex) {
      cache[cacheIndex] = cache[cacheIndex] || (isArray ? [] : {})
      cache = cache[cacheIndex]
      collectLevel[cacheIndex] = collectLevel[cacheIndex] || (isArray ? [] : {})
      collectLevel = collectLevel[cacheIndex]
    }

    return this.fetchLevel(level, prevVal, collected, collectLevel, cache, cacheIndex)
  }

  // Fetch a level. It could be an array or a map
  // [
  //   {
  //     a: [fn, key, cb],
  //     b: [fn, key, cb]
  //   },
  //   {
  //     c: [
  //       [fn, key, cb],
  //       [fn, key, cb],
  //       {
  //         d: [fn, key, cb],
  //         e: [fn, key, cb],
  //         ...
  //       }
  //     ]
  //   }
  // ]
  async fetchLevel(promises, prevVal, collected, collectLevel, cache, cacheIndex) {
    if (!promises || !this.running) return

    if (Array.isArray(promises)) {
      // It's an array, call entries in sequence
      const res = []
      for (const [i, p] of Object.entries(promises)) {
        if (!this.running) return res

        const r = await this.fetchNextLevel(p, res[i - 1], collected, collectLevel, cache, i)
        collectLevel[i] = r
        res.push(r)
      }
      return res
    }

    // It's an object, call entries in parallel
    const res = {}
    await Promise.all(Object.entries(promises).map(([k, p]) => {
      return this.fetchNextLevel(p, prevVal, collected, collectLevel, cache, k).then(val => res[k] = val)
    }))
    for (const [k, v] of Object.entries(res)) {
      collectLevel[k] = v
    }
    return res
  }

  // Resolve a promise entry
  // A promise entry has a function returning a Promise or Fetcher,
  // a cache key and a callback
  resolvePromiseEntry([promiseFn, key, cb], prevVal, collected, cache, cacheIndex) {
    const cacheable = !!key
    if (cacheable && (cache[cacheIndex] || {}).key === key && (cache[cacheIndex] || {}).complete) {
      // Found the result in the cache, move on to the next promise
      return this.applyCallback(cache[cacheIndex].value, cb)
    }

    // If cache is a sequence, invalidate this and any subsequent
    // entries in the sequence
    if (Array.isArray(cache)) {
      for (let i = parseInt(cacheIndex, 10); i < cache.length; i++) {
        delete cache[i]
      }
    }

    if (cacheable) {
      cache[cacheIndex] = {
        complete: false,
        key
      }
    }

    // Resolve the Promise / Fetcher from the function
    const res = promiseFn(prevVal, collected)
    if (res instanceof Promise || res instanceof Fetcher) {
      const executionId = Math.random()
      this.executing[executionId] = res

      return res.then(val => {
        delete this.executing[executionId]

        if (this.running) {
          this.applyCallback(val, cb)

          if (cacheable && this.running) {
            cache[cacheIndex].value = val
            cache[cacheIndex].complete = true
          }
        }

        return val
      })
    }
    return res
  }

  // Run a promise then call a callback (doesn't call callback if
  // promise monitor has been cancelled)
  runThen(promise, callback) {
    if (!promise) return

    if (promise instanceof Promise || promise instanceof Fetcher) {
      return promise.then(res => this.applyCallback(res, callback))
    }
    return this.applyCallback(promise, callback)
  }

  applyCallback(val, cb) {
    if (!cb) return

    // If the callback is a string, just call setState() on
    // the component with that string as the variable name
    if (typeof cb === 'string') {
      this.component.setState({[cb]: val})
      return val
    }

    // Otherwise call the callback
    cb(val)
    return val
  }
}

//
// IGComponent helps with rendering Components that need to respond to
// changes in the URL.
// The triggerPromises() method allows a sub-class to provide a structure of
// Promises / Fetchers to be called when the URL changes, and optionally
// cache the value so that URL changes don't cause re-fetches.
// Note that the cache does not persist after the component is unmounted.
//
class IGComponent extends Component {
  //
  // Promises is a structure of maps and arrays, where array
  // entries run in sequence and map entries run in parallel
  //
  // [
  //   <map entries run in parallel>
  //   {
  //     a: [fn, key, cb],
  //     b: [fn, key, cb]
  //   },
  //   {
  //     c: [
  //       <array entries run in sequence>
  //       [fn, key, cb],
  //       [fn, key, cb],
  //       {
  //         d: [fn, key, cb],
  //         e: [fn, key, cb],
  //         ...
  //       }
  //     ]
  //   }
  // ]
  //
  // The base unit of the structure is an entry containing
  // [<function returning a Promise / Fetcher>, key, callback]
  // - callback is called if the Promise / Fetcher completes successfully.
  //   If callback is a string, then setState() is called with the string
  //   as the variable name and the promise result as the value
  //   eg setState({ 'repo': value })
  //   The arguments to callback are (prevValue, collected)
  //   o prevValue is the previous value, eg sequence[i - 1]
  //   o collected is the all the values that have been collected so far
  //     in the structure
  // - On repeated calls to this function, if the same key is at the same
  //   index, the same result will be returned from an internal cache,
  //   unless key is falsey
  // Example:
  // [() => GitRepo.fetch(this.repoCid), this.repoCid, 'repo']
  //
  triggerPromises(promises) {
    // Ignore repeated calls with the same parameters
    if (this.runningPromises && this.runningPromises.sameAs(promises)) return

    this.runningPromises && this.runningPromises.cancel()
    this.runningPromises = new PromiseMonitor(this, promises, (this.runningPromises || {}).cache)
    return this.runningPromises.run()
  }

  // Run a promise then call a callback, if the component has not been
  // unmounted
  runThen(promise, callback) {
    if (this.runningPromises) {
      return this.runningPromises.runThen(promise, callback)
    }
    return promise
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
