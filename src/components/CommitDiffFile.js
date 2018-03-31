import React, { Component } from 'react'
import Highlight from 'react-highlight'

class CommitDiffFile extends Component {
  render() {
    const c = this.props.change
    const str0 = (c.change[0] || '').toString()
    const str1 = (c.change[1] || '').toString()
    const patch = require('diff').createPatch(c.name, str1, str0)
    return (
      <div className="CommitDiffFile">
        <div>{c.name}</div>
        <Highlight className="diff">{patch}</Highlight>
      </div>
    )
  }
}

export default CommitDiffFile
