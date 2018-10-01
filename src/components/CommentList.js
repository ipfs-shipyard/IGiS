import React, { Component } from 'react'
import Comment from './Comment'

class CommentList extends Component {
  isDataReady(props, state) {
    return !!props.comments
  }

  Element(props) {
    return (
      <div className="CommentList">
        {props.children}
      </div>
    )
  }

  render() {
    if (this.props.comments) {
      return this.renderContent(this.props.comments)
    }
    return this.renderLoading()
  }

  renderContent(comments) {
    return (
      <this.Element>
        {this.renderComments(comments)}
      </this.Element>
    )
  }

  renderComments(comments) {
    if (!comments.length) return <p className="no-comments">There are no comments yet</p>

    return comments.map((c, i) => <Comment key={c ? c.cid.toBaseEncodedString() : i} comment={c} />)
  }

  renderLoading() {
    return (
      <this.Element>
        {this.renderComments([...Array(3)])}
      </this.Element>
    )
  }
}

export default CommentList
