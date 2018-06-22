import React, { Component } from 'react'
import CommitDiffFile from './CommitDiffFile'

class CommitDiffList extends Component {
  render() {
    if (!(this.props.changes || []).length) {
      return null
    }

    return (
      <div className="CommitDiffList">
        {this.renderFiles(this.props.changes)}
      </div>
    )
  }

  renderFiles(changes) {
    return changes.map(c => (
      <CommitDiffFile key={c.path + '/' + c.name} change={c} />
    ))
  }
}

export default CommitDiffList
