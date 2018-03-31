import React, { Component } from 'react'
const ReactMarkdown = require('react-markdown')

class Readme extends Component {
  render() {
    if (!this.props.blob) return null

    return (
      <div className="Readme">
        <div className="title">README.md</div>
        <div className="source">
          <ReactMarkdown source={this.props.blob.toString()} />
        </div>
      </div>
    )
  }
}

export default Readme
