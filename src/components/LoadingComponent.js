import { Component } from 'react'

class LoadingComponent extends Component {
  render() {
    const dataReady = this.isDataReady(this.props || {}, this.state || {})
    const loading = dataReady ? 'COMPLETE' : this.loading === 'LOADING' && 'LOADING'

    if (loading === 'COMPLETE') {
      clearTimeout(this.loadingTimeout)
      this.loadingTimeout = null
      this.loading = null
      return this.renderContent()
    }
    if(loading === 'LOADING') {
      return this.renderLoading()
    }

    // If the data is not yet ready to be rendered, wait for a very short interval
    // before rendering the loading content. This wait reduces flickering if the data
    // is cached and takes a very short but non-zero time to load
    this.loadingTimeout = this.loadingTimeout || setTimeout(() => {
      this.loadingTimeout = null
      this.loading = 'LOADING'
      this.forceUpdate()
    }, 100)
    return null
  }

  // To be overridden by subclasses
  isDataReady(props, state) {
    return false
  }

  // To be overridden by subclasses
  renderContent() {
    return null
  }

  // To be overridden by subclasses
  renderLoading() {
    return null
  }
}

export default LoadingComponent
