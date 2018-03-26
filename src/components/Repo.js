import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import BreadCrumb from "./BreadCrumb";
import Tree from "./Tree";
import FileContent from "./FileContent";
import Menu from "./Menu";
import MenuEntry from "./MenuEntry";
import WithMenu from "./WithMenu";
import CommitTitle from "./CommitTitle";

const TYPE_FILE = 'file'
const TYPE_DIR = 'dir'

class Repo extends Component {
  constructor(props) {
    super(props)
    this.initialized = false
    this.state = {}
  }

  componentWillReceiveProps(nextProps) {
    // Trigger a fetch each time the url changes, as the user
    // navigates through the tree of files
    this.triggerFetch(nextProps.location.pathname)
  }

  render() {
    const pathname = this.props.location.pathname

    // If we have not yet fetched the data for the repo, continue with
    // rendering but trigger a fetch in the background (which will
    // call render again on completion)
    if (!this.initialized) { // TODO: Is there another way to detect this?
      this.triggerFetch(pathname)
    }

    const content = this.state.type === TYPE_FILE ? (
      <FileContent file={this.state.data} path={this.state.pathname} />
    ) : (
      <Tree files={this.state.data || []} />
    )

    // /repo/<cid>/my/file/path.go
    const parts = pathname.split('/')
    const basePath = parts.slice(0, 2).join('/')
    const crumbs = parts.slice(2)

    const { match: { params } } = this.props
    return (
      <WithMenu>
        <Menu>
          <MenuEntry><Link to="/">Home</Link></MenuEntry>
          <MenuEntry><Link to={"/repo/" + params.repoCid}>Tree Root</Link></MenuEntry>
        </Menu>
        <main>
          <BreadCrumb path={basePath} crumbs={crumbs} />
          <CommitTitle commit={this.state.commit} />
          {content}
        </main>
      </WithMenu>
    )
  }

  triggerFetch(pathname) {
    this.initialized = true
    this.triggerCommitFetch(pathname)
    this.triggerPathFetch(pathname)
  }

  triggerCommitFetch(pathname) {
    // /repo/<cid>/my/file/path.go
    let parts = pathname.split('/')
    let cid = parts[2]
    if (this.state.cid === cid) {
      return
    }

    window.ipfs.dag.get(cid).then(res => {
      // console.log(`dag get ${cid}`)
      // console.log(res)
      this.setState({
        cid,
        commit: res.value
      })
    })
  }

  triggerPathFetch(pathname) {
    if (this.state.pathname === pathname) {
      return
    }

    // /repo/<cid>/my/file/path.go
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
