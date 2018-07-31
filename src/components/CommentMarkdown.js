import React, { Component } from 'react'
import showdown from 'showdown'

class CommentMarkdown extends Component {
  constructor(props) {
    super(props)
    showdown.setFlavor('github')
    this.converter = new showdown.Converter()
  }

  render() {
    const content = this.props.source
    if (content == null) return null

    return (
      <div className="CommentMarkdown" dangerouslySetInnerHTML={{__html: this.converter.makeHtml(content)}} />
    )
  }
}

export default CommentMarkdown
