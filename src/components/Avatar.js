import React, { Component } from 'react'

class Avatar extends Component {
  Element(props) {
    return (
      <div className="Avatar" style={ props.imageUrl && { backgroundImage: `url(${props.imageUrl})` } }>
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
    return <this.Element imageUrl={this.props.user.getAvatar()} />
  }

  renderLoading() {
    return (
      <this.Element>
        <div className="Loading" />
      </this.Element>
    )
  }
}

export default Avatar
