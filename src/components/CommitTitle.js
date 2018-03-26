import React, { Component } from 'react';
import moment from 'moment'

class CommitTitle extends Component {
  render() {
    const commit = this.props.commit
    if (!commit) {
      return <div>Loading</div>
    }

    let commitMessage = commit.message
    if (commitMessage.length > 80) {
      commitMessage = commitMessage.substring(0, 80) + '...'
    }

    return (
      <div className="CommitTitle">
        <div className="author">
          <span>{(commit.author || {}).name}</span>:
        </div>
        <div className="description">
          {commitMessage}
        </div>
        <div className="at">
          {moment((commit.committer || {}).date, 'X ZZ').fromNow()}
        </div>
      </div>
    )
  }
}

export default CommitTitle
