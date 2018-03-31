import React, { Component } from 'react'
import TreeItem from './TreeItem'

class Tree extends Component {
  render() {
    if (!this.props.tree) {
      return null
    }

    return (
      <div className="Tree">
        {this.renderFiles(this.props.tree.files)}
      </div>
    )
  }

  renderFiles(files) {
    return files.map(file =>
      <TreeItem key={file.name} basePath={this.props.path} file={file} />
    )
  }
}

export default Tree
