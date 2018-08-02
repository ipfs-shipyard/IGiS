import Avatar from './Avatar'
import Button from './Button'
import CommentMarkdown from './CommentMarkdown'
import React, { Component } from 'react'
import { RepoCrdt } from '../lib/crdt/CRDT'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

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
          <Tabs>
            <TabList>
              <Tab>Comment</Tab>
              <Tab>Preview</Tab>
            </TabList>

            <TabPanel>
              <textarea
               onChange={ e => this.setState({ value: e.target.value}) }
               placeholder="Leave a comment"
               value={this.state.value} />
            </TabPanel>
            <TabPanel>
              <div className="preview">
                <CommentMarkdown source={this.state.value} />
              </div>
            </TabPanel>
          </Tabs>
          <div className="button-container">
            <Button isLink={true} onClick={this.handleSubmit.bind(this)}>Comment</Button>
          </div>
        </div>
      </div>
    )
  }

  async handleSubmit() {
    await new RepoCrdt(this.props.repoCid).newComment(this.props.pullCid, this.state.value)
    this.setState({ value: '' })
  }
}

export default NewCommentForm
