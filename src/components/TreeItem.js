import React, { Component } from 'react';
import { Link } from 'react-router-dom'

class TreeItem extends Component {
  render() {
    const file = this.props.value
    let c = 'item '
    c += this.props.value.isDir ? 'dir' : 'file'

    return (
      <Link to={file.path + '/' + file.name} className={c}>
        {file.name}
      </Link>
    )
  }
}

export default TreeItem
