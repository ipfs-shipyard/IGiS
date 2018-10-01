import Avatar from './Avatar'
import Button from './Button'
import CommentEditor from './CommentEditor'
import React, { Component } from 'react'
import { RepoCrdt } from '../lib/crdt/CRDT'

class NewCommentForm extends Component {
  constructor() {
    super()
    this.state = {
      value: ''
    }
  }

  render() {
    if (!this.props.author) return null

    return (
      <div className="NewCommentForm">
        <Avatar user={this.props.author} />
        <div className="comment-area">
          <CommentEditor value={this.state.value} onChange={ value => this.setState({ value }) } />
          <div className="button-container">
            <Button isLink={true} onClick={this.handleSubmit.bind(this)}>Comment</Button>
          </div>
        </div>
      </div>
    )
  }

  async handleSubmit() {
    await new RepoCrdt(this.props.repoCid).newComment(this.props.prCid, this.state.value)
    this.setState({ value: '' })
  }
}

export default NewCommentForm
