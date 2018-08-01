import Avatar from './Avatar'
import Button from './Button'
import React, { Component } from 'react'
import { RepoCrdt } from '../lib/crdt/CRDT'

class NewCommentForm extends Component {
  render() {
    if (!this.props.author) return null

    return (
      <div className="NewCommentForm">
        <Avatar user={this.props.author} />
        <div className="comment-area">
          <textarea placeholder="Leave a comment" ref={i => { this.commentInput = i }} />
          <div className="button-container">
            <Button isLink={true} onClick={this.handleSubmit.bind(this)}>Comment</Button>
          </div>
        </div>
      </div>
    )
  }

  async handleSubmit() {
    await new RepoCrdt(this.props.repoCid).newComment(this.props.pullCid, this.commentInput.value)
    this.commentInput.value = ''
  }
}

export default NewCommentForm
