export default class Fetcher {
  start() {
    this.running = true
    this.promise = this.run().then(res => {
      this.running = false
      return res
    })
    return this
  }
  run() {
    throw new Error('Fetcher must implement a run() function that returns a promise')
  }
  cancel() {
    this.running = false
    this.onCancel && this.onCancel()
  }
  then(fn) {
    return this.promise.then(fn)
  }
}
