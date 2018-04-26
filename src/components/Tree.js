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
    return files.sort(Tree.compareFiles).map(file =>
      <TreeItem key={file.name} repo={this.props.repo} tree={this.props.tree} file={file} />
    )
  }

  static compareFiles(a, b) {
    if(a.isDir() !== b.isDir()) {
      return a.isDir() ? -1 : 1;
    }
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }

    return 0;
  }
}

export default Tree
