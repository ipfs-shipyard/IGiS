import React from 'react'
import Comment from './Comment'
import LoadingComponent from './LoadingComponent'

class CommentList extends LoadingComponent {
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

  renderContent() {
    return (
      <this.Element>
        {this.renderComments(this.props.comments)}
      </this.Element>
    )
  }

  renderComments(comments) {
    return comments.map((c, i) => <Comment key={c ? c.hash : i} comment={c} />)
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
