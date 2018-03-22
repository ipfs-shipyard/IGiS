import React, { Component } from 'react';
import TreeItem from './TreeItem'

class Tree extends Component {
  render() {
    if (!(this.props.files || []).length) {
      return <div>Loading</div>
    }

    return (
      <div className="Tree">
        {this.renderFiles(this.props.files)}
      </div>
    )
  }

  renderFiles(files) {
    return files.map(file =>
      <TreeItem key={file.name} value={file} />
    )
  }
}

export default Tree
