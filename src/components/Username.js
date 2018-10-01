import React, { Component } from 'react'

class Username extends Component {
  Element(props) {
    return (
      <div className="Username">
        {props.children}
      </div>
    )
  }

  render() {
    if (this.props.user) {
      return this.renderContent()
    }
    return this.renderLoading()
  }

  renderContent() {
    return <this.Element>{this.props.user.username}</this.Element>
  }

  renderLoading() {
    return (
      <this.Element>
        <div className="Loading" />
      </this.Element>
    )
  }
}

export default Username
