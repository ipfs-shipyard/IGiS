import React, { Component } from 'react'
import CommitListItem from './CommitListItem'

class CommitList extends Component {
  render() {
    if (!(this.props.commits || []).length) {
      return this.renderLoading()
    }

    return (
      <div className="CommitList">
        {this.renderCommits(this.props.commits)}
      </div>
    )
  }

  renderCommits(commits) {
    return commits.map(c =>
      <CommitListItem key={c.cid} repoCid={this.props.repoCid} commit={c} />
    )
  }

  renderLoading() {
    this.loadingLengths = this.loadingLengths || [...Array(3)].map(() => [
      7.4, 15 + Math.random() * 10, 4 + Math.random() * 2
    ])
    const lengths = this.loadingLengths.slice((this.props.commits || []).length)
    return (
      <div className={ "CommitListLoading" + ((this.props.commits || []).length ? '' : ' no-commits') }>
        {lengths.map((item, i) => (
          <div className="item" key={i}>
            {item.map((l, j) => (
              <div key={j} style={{width: l + 'em'}} />
            ))}
          </div>
        ))}
      </div>
    )
  }
}

export default CommitList
