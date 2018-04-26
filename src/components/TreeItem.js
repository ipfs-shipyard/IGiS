import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Url from '../lib/Url'

class TreeItem extends Component {
  render() {
    const { repo, tree, file } = this.props
    let c = 'item '
    c += file.isDir() ? 'dir' : 'file'

    return (
      <Link to={Url.toFile(repo, tree, file)} className={c}>
        {file.name}
      </Link>
    )
  }
}

export default TreeItem
