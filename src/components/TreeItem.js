import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class TreeItem extends Component {
  render() {
    const { file, basePath } = this.props
    let c = 'item '
    c += file.isDir() ? 'dir' : 'file'

    return (
      <Link to={basePath + '/' + file.name} className={c}>
        {file.name}
      </Link>
    )
  }
}

export default TreeItem
