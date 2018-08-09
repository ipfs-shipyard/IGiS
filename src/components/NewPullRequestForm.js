import Button from './Button'
import CommentEditor from './CommentEditor'
import React, { Component } from 'react'
import { RepoCrdt } from '../lib/crdt/CRDT'
import Url from '../lib/Url'

class NewPullRequestForm extends Component {
  constructor() {
    super()
    this.state = {
      value: ''
    }
  }

  render() {
    return (
      <div className="NewPullRequestForm">
        <input autoFocus placeholder="Title of Pull Request" type="text" maxLength="80" ref={i => { this.nameInput = i }} />

        <CommentEditor value={this.state.value} onChange={ value => this.setState({ value }) } />

        <div className="button-container">
          { !!this.props.onCancel && (
            <Button onClick={() => this.props.onCancel()}>Cancel</Button>
          )}
          <Button isLink={true} onClick={this.handleSubmit.bind(this)}>Create Pull Request</Button>
        </div>
      </div>
    )
  }

  async handleSubmit() {
    const base = {
      repo: this.props.repoCid,
      ref: this.props.branches[0]
    }
    const compare = {
      repo: this.props.repoCid,
      ref: this.props.branches[1]
    }
    const comment = this.state.value
    this.setState({ value: '' })
    
    const pr = await new RepoCrdt(this.props.repoCid).newPR(base, compare, this.nameInput.value, comment)
    window.location.hash = Url.toPullRequest(this.props.repoCid, pr.cid.toBaseEncodedString())
  }
}

export default NewPullRequestForm
