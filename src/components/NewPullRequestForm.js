import Button from './Button'
import React, { Component } from 'react'
import { RepoCrdt } from '../lib/crdt/CRDT'
import Url from '../lib/Url'

class NewPullRequestForm extends Component {
  render() {
    return (
      <div className="NewPullRequestForm">
        <input autoFocus placeholder="Title of Pull Request" type="text" maxLength="80" ref={i => { this.nameInput = i }} />
        <textarea placeholder="Leave a comment" ref={i => { this.commentInput = i }} />
        <div className="button-container">
          { !!this.props.onCancel && (
            <Button onClick={() => this.props.onCancel()}>Cancel</Button>
          )}
          <Button isLink={true} onClick={this.handleButtonClick.bind(this)}>Create Pull Request</Button>
        </div>
      </div>
    )
  }

  async handleButtonClick() {
    const base = {
      repo: this.props.repoCid,
      ref: this.props.branches[0]
    }
    const compare = {
      repo: this.props.repoCid,
      ref: this.props.branches[1]
    }
    const pr = await new RepoCrdt(this.props.repoCid).newPR(base, compare, this.nameInput.value, this.commentInput.value)
    window.location.hash = Url.toPullRequest(this.props.repoCid, pr.cid.toBaseEncodedString())
  }
}

export default NewPullRequestForm
