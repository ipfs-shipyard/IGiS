import CommentMarkdown from './CommentMarkdown'
import React, { Component } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

class CommentEditor extends Component {
  constructor() {
    super()
  }

  render() {
    return (
      <div className="CommentEditor">
        <Tabs>
          <TabList>
            <Tab>Comment</Tab>
            <Tab>Preview</Tab>
          </TabList>

          <TabPanel>
            <textarea
             onChange={this.onChange.bind(this)}
             placeholder="Leave a comment"
             value={this.props.value} />
          </TabPanel>
          <TabPanel>
            <div className="preview">
              <CommentMarkdown source={this.props.value} />
            </div>
          </TabPanel>
        </Tabs>
      </div>
    )
  }

  onChange(e) {
    this.props.onChange && this.props.onChange(e.target.value)
  }
}

export default CommentEditor
