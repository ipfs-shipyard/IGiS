import React, { Component } from 'react'
import { User } from '../lib/crdt/CRDT'

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
    return <this.Element imageUrl={User.getAvatarFromParams(this.props.user.avatar, this.props.user.username)} />
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
