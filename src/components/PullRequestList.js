import React, { Component } from 'react'
import PullRequestListItem from './PullRequestListItem'

class PullRequestList extends Component {
  Element(props) {
    return (
      <div className="PullRequestList">
        {props.children}
      </div>
    )
  }

  render() {
    if (!this.props.prs) {
      return this.renderLoading()
    }

    return (
      <this.Element>
        {this.renderPullRequests(this.props.prs)}
      </this.Element>
    )
  }

  renderPullRequests(prs) {
    return prs.map(pr =>
      <PullRequestListItem key={pr.cid.toBaseEncodedString()} repoCid={this.props.repoCid} pr={pr} />
    )
  }

  renderLoading() {
    this.loadingLengths = this.loadingLengths || [...Array(10)].map(() => [
      7.4, 15 + Math.random() * 10, 4 + Math.random() * 2
    ])
    const lengths = this.loadingLengths.slice((this.props.prs || []).length)
    return (
      <this.Element>
        <div className="Loading">
          {lengths.map((item, i) => (
            <div className="item" key={i}>
              {item.map((l, j) => (
                <div key={j} style={{width: l + 'em'}} />
              ))}
            </div>
          ))}
        </div>
      </this.Element>
    )
  }
}

export default PullRequestList
