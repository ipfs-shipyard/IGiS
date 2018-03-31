import BreadCrumb from "./BreadCrumb"
import CommitTitle from "./CommitTitle"
import FileContent from "./FileContent"
import Git from '../lib/git/Git'
import GitBlob from '../lib/git/GitBlob'
import GitTree from '../lib/git/GitTree'
import React, { Component } from 'react'
import Readme from "./Readme"
import RepoLinks from "./RepoLinks"
import Tree from "./Tree"

class Repo extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const pathname = this.props.location.pathname

    // If we have not yet fetched the data for the repo, continue with
    // rendering but trigger a fetch in the background (which will
    // call render again on completion)
    this.triggerCommitFetch(pathname)
    this.triggerPathFetch(pathname)

    let content = null
    if (this.state.data instanceof GitBlob) {
      content = <FileContent content={this.state.data} path={pathname} />
    } else if (this.state.data instanceof GitTree) {
      content = (
        <div>
          <Tree tree={this.state.data} path={pathname} />
          <Readme blob={this.state.readme} />
        </div>
      )
    }

    // /repo/<cid>/my/file/path.go
    const parts = pathname.split('/')
    const basePath = parts.slice(0, 2).join('/')
    const crumbs = parts.slice(2)

    const { match: { params: { repoCid } } } = this.props
    return (
      <div className="Repo">
        {parts.length === 3 &&
          <RepoLinks cid={repoCid} />
        }
        <BreadCrumb path={basePath} crumbs={crumbs} />
        <CommitTitle commit={this.state.commit} />
        {content}
      </div>
    )
  }

  // Get the commit for the CID in the url
  triggerCommitFetch(pathname) {
    if (this.commitFetched) return
    this.commitFetched = true

    // /repo/<cid>/my/file/path.go
    let parts = pathname.split('/')
    let cid = parts[2]
    Git.fetch(cid).then(commit => this.setState({ commit }))
  }

  // Get the tree or blob identified in the url
  triggerPathFetch(pathname) {
    if (this.pathFetched === pathname) return
    this.pathFetched = pathname

    // /repo/<cid>/my/file/path.go
    let parts = pathname.split('/')
    let cid = parts[2]
    let rest = parts.slice(3)
    let dagPath = `${cid}/tree`
    if (rest.length) {
      dagPath += '/' + rest.join('/hash/') + '/hash'
    }
    Git.fetch(dagPath).then(data => {
      this.setState({ data })
      this.triggerReadmeFetch()
    })
  }

  // If there's a README.md file in the tree,
  // fetch its contents and render
  triggerReadmeFetch() {
    this.setState({ readme: null })

    const tree = this.state.data
    if (!tree || !(tree instanceof GitTree)) return

    const readme = tree.files.find(f => f.name === 'README.md')
    if (!readme) return

    readme.fetchContents().then(blob => this.setState({ readme: blob }))
  }
}

export default Repo
