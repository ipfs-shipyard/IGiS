import React from 'react'
import Avatar from './Avatar'
import CommentMarkdown from './CommentMarkdown'
import LoadingComponent from './LoadingComponent'
import Username from './Username'

class Comment extends LoadingComponent {
  isDataReady(props, state) {
    return !!props.comment
  }

  Element(props) {
    const c = props.comment || {}
    return (
      <div className="Comment">
        <Avatar user={c.author} />
        <div className="content">
          <div>
            <Username user={c.author} />
            <div className="at">
              {c.createdAt ? c.createdAt.fromNow() : <div className="Loading" />}
            </div>
          </div>
          <div className="text">
            {props.children}
          </div>
        </div>
      </div>
    )
  }

  renderContent() {
    return (
      <this.Element comment={this.props.comment}>
        <CommentMarkdown source={this.props.comment.text} />
      </this.Element>
    )
  }

  renderLoading() {
    this.lengths = this.lengths || [...Array(2 + Math.floor(Math.random() * 3))].map(() => 20 + Math.random() * 25)
    return (
      <this.Element>
        <div className="Loading">
          {this.lengths.map((l, i) => (
            <div className="item" key={i} style={{width: l + 'em'}} />
          ))}
        </div>
      </this.Element>
    )
  }
}

export default Comment
