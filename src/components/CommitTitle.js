import React, { Component } from 'react'

class CommitTitle extends Component {
  render() {
    const commit = this.props.commit
    if (!commit) return null

    return (
      <div className="CommitTitle">
        <div className="author">
          <span>{(commit.author || {}).name}</span>:
        </div>
        <div className="description">
          {commit.summary}
        </div>
        <div className="at">
          {commit.author.moment.fromNow()}
        </div>
      </div>
    )
  }
}

export default CommitTitle
