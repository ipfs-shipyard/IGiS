import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import Tree from "./Tree";
import FileContent from "./FileContent";
import Menu from "./Menu";
import MenuEntry from "./MenuEntry";
import WithMenu from "./WithMenu";

const TYPE_FILE = 'file'
const TYPE_DIR = 'dir'

class Repo extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentWillReceiveProps(nextProps) {
    this.triggerFetch(nextProps.location.pathname)
  }

  render() {
    if (!this.state.type) {
      this.triggerFetch(this.props.location.pathname)
    }

    const { match: { params } } = this.props
    const content = this.state.type === TYPE_FILE ? (
      <FileContent file={this.state.data} path={this.state.pathname} />
    ) : (
      <Tree files={this.state.data || []} />
    )

    return (
      <WithMenu>
        <Menu>
          <MenuEntry><Link to="/">Home</Link></MenuEntry>
          <MenuEntry><Link to={"/repo/" + params.repoCid}>Tree Root</Link></MenuEntry>
        </Menu>
        <main>{content}</main>
      </WithMenu>
    )
  }

  triggerFetch(pathname) {
    if (pathname === this.state.pathname) {
      return
    }

    let parts = pathname.split('/')
    let cid = parts[2]
    let rest = parts.slice(3)
    let dagPath = `${cid}/tree`
    if (rest.length) {
      dagPath += '/' + rest.join('/hash/') + '/hash'
    }
    window.ipfs.dag.get(dagPath).then(res => {
      // console.log(`dag get ${dagPath}`)
      // console.log(res)

      const state = { pathname }
      if (res.value._isBuffer) {
        state.type = TYPE_FILE
        state.data = res.value
      } else {
        state.type = TYPE_DIR
        state.data = this.getFileObjects(res.value)
      }
      this.setState(state)
    })
  }

  getFileObjects(dagFiles) {
    const files = Object.keys(dagFiles).map(filename => {
      const file = dagFiles[filename]
      file.path = this.props.location.pathname
      file.name = filename
      file.isDir = file.mode[0] === '4'
      return file
    })

    // Sort directories to the top, followed by files
    files.sort((a, b) => {
      if (a.isDir) {
        if (b.isDir) {
          return a.name > b.name ? 1 : -1
        } else {
          return 1
        }
      } else {
        if (b.isDir) {
          return 1
        } else {
          return a.name > b.name ? 1 : -1
        }
      }
    })

    return files
  }
}

export default Repo
