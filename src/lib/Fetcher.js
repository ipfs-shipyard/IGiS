export default class Fetcher {
  start() {
    this.running = true
    this.promise = this.run().then(res => {
      this.running = false
      return res
    })
    return this.promise
  }
  cancel() {
    this.running = false
  }
  then(fn) {
    this.promise.then(fn)
  }
}
