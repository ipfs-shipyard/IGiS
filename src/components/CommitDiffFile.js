import React from 'react'
import LoadingComponent from './LoadingComponent'
import Highlight from 'react-highlight'

class CommitDiffFile extends LoadingComponent {
  isDataReady(props, state) {
    return !!(props.change || {}).files
  }

  Element(props) {
    const c = props.change
    return (
      <div className="CommitDiffFile">
        <div>{c.path}</div>
        {props.children}
      </div>
    )
  }

  renderContent() {
    const c = this.props.change
    const str0 = (c.files[0] || '').toString()
    const str1 = (c.files[1] || '').toString()
    const patch = require('diff').createPatch(c.name, str1, str0)
    return (
      <this.Element change={c}>
        <Highlight className="diff">{patch}</Highlight>
      </this.Element>
    )
  }

  renderLoading() {
    const lengths = [...Array(Math.floor(4 + Math.random() * 2))].map(() => 10 + Math.random() * 50)
    return (
      <this.Element change={this.props.change}>
        <div className="Loading">
          {lengths.map((l, i) => (
            <div className="item" key={i} style={{width: l + 'em'}} />
          ))}
        </div>
      </this.Element>
    )
  }
}

export default CommitDiffFile
