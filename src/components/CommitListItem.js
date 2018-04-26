import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class CommitListItem extends Component {
  render() {
    const commit = this.props.commit

    return (
      <div className="CommitListItem">
        <div className="author">
          {commit.author.name}
        </div>
        <div className="description">
          <Link to={`/repo/${this.props.repoCid}/commit/${commit.cid}`}>{commit.summary}</Link>
        </div>
        <div className="at">
          {commit.author.moment.fromNow()}
        </div>
      </div>
    )
  }
}

export default CommitListItem
