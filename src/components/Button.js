import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class Button extends Component {
  render() {
    const linkParent = this.props.isLink || this.props.children.type === Link
    return (
      <span className={(this.props.className || '') + " Button" + (linkParent ? " link-parent" : "")} onClick={this.props.onClick}>
        {this.props.children}
      </span>
    )
  }
}

export default Button
