import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Username from './Username'

class PullRequestListItem extends Component {
  render() {
    const pr = this.props.pr

    return (
      <div className="PullRequestListItem">
        <div className="author">
          <Username user={pr.author} />
        </div>
        <div className="name">
          <Link to={`/repo/${this.props.repoCid}/pull/${pr.cid.toBaseEncodedString()}`}>{pr.name}</Link>
        </div>
        <div className="at">
          {pr.createdAt.fromNow()}
        </div>
      </div>
    )
  }
}

export default PullRequestListItem
