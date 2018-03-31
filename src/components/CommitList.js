import React, { Component } from 'react'
import CommitListItem from './CommitListItem'

class CommitList extends Component {
  render() {
    if (!(this.props.commits || []).length) {
      return <div>Loading</div>
    }

    return (
      <div className="CommitList">
        {this.renderCommits(this.props.commits)}
      </div>
    )
  }

  renderCommits(commits) {
    return commits.map(c =>
      <CommitListItem key={c.cid} commit={c} />
    )
  }
}

export default CommitList
