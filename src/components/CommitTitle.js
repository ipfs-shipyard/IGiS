import React from 'react'
import LoadingComponent from './LoadingComponent'

class CommitTitle extends LoadingComponent {
  isDataReady(props, state) {
    return !!props.commit
  }

  Element(props) {
    return (
      <div className="CommitTitle">
        {props.children}
      </div>
    )
  }

  renderContent() {
    const commit = this.props.commit
    return (
      <this.Element>
        <div className="author">
          <span>{(commit.author || {}).name}</span>:
        </div>
        <div className="description">
          {commit.summary}
        </div>
        <div className="at">
          {commit.author.moment.fromNow()}
        </div>
      </this.Element>
    )
  }

  renderLoading() {
    const lengths = [5 + Math.random() * 4, 20 + Math.random() * 10, 5 + Math.random() * 2]
    return (
      <this.Element>
        <div className="Loading">
          {lengths.map((l, i) => (
            <div className="item" key={i} style={{width: l + 'em'}} />
          ))}
        </div>
      </this.Element>
    )
  }
}

export default CommitTitle
