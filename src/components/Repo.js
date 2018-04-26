import CommitTitle from "./CommitTitle"
import FileContent from "./FileContent"
import Git from '../lib/git/Git'
import GitBlob from '../lib/git/GitBlob'
import GitRepo from '../lib/git/GitRepo'
import GitTree from '../lib/git/GitTree'
import React, { Component } from 'react'
import Readme from "./Readme"
import RepoLinks from "./RepoLinks"
import Tree from "./Tree"
import Url from '../lib/Url'

class Repo extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const pathname = this.props.location.pathname
    const url = Url.parseRepoPath(pathname)

    // If we have not yet fetched the data for the repo, continue with
    // rendering but trigger a fetch in the background (which will
    // call render again on completion)
    this.triggerFetch(url.repoCid, url.branch)

    let content = null
    if (url.gitType === 'blob' && this.state.data instanceof GitBlob) {
      content = <FileContent content={this.state.data} path={pathname} />
    } else if (this.state.data instanceof GitTree) {
      content = (
        <div>
          <Tree repo={this.state.repo} tree={this.state.data} />
          <Readme blob={this.state.readme} />
        </div>
      )
    }

    const defaultBranch = url.branch || GitRepo.branchNick((this.state.repo || {}).defaultBranch)
    return (
      <div className="Repo">
        <RepoLinks repo={this.state.repo} url={url} branch={defaultBranch} />
        <CommitTitle commit={this.state.commit} />
        {content}
      </div>
    )
  }

  async triggerFetch(repoCid, branch) {
    if (this.repoFetched) {
      this.triggerBranchFetch(branch)
      return
    }
    this.repoFetched = true

    // Get the repo
    return GitRepo.fetch(repoCid, repo => {
      this.setState({ repo })
      this.triggerBranchFetch(branch)
    })
  }

  triggerBranchFetch(branch) {
    const repo = this.state.repo
    if (!repo) return

    const commit = repo.headCommit(branch)
    this.triggerPathFetch(commit)
  }

  // Get the blob or tree identified in the url
  triggerPathFetch(commit) {
    const pathname = this.props.location.pathname
    if (this.pathFetched === pathname) return
    this.pathFetched = pathname

    const url = Url.parseRepoPath(pathname)
    let dagPath = `${commit.cid}/tree`
    if (url.filePathParts.length) {
      dagPath += '/' + url.filePathParts.join('/hash/') + '/hash'
    }
    Git.fetch(dagPath).then(data => {
      this.setState({ data, commit })
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
