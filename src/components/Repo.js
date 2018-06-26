import CommitTitle from "./CommitTitle"
import FileContent from "./FileContent"
import GitRepo from '../lib/git/GitRepo'
import GitTag from '../lib/git/GitTag'
import GitTree from '../lib/git/GitTree'
import IGComponent from './IGComponent'
import React from 'react'
import Readme from "./Readme"
import RepoLinks from "./RepoLinks"
import Tree from "./Tree"
import Url from '../lib/Url'

class Repo extends IGComponent {
  constructor(props) {
    super(props)
    this.state = {}
  }

  pathDidChange(urlPath) {
    this.setState({ data: null, readme: null })

    // Fetch the repo, the branch head, the commit and
    // any associated README in consecutive calls. Note
    // that each will update the state, triggering a new
    // render
    const url = Url.parseRepoPath(urlPath)
    this.triggerPromises([
      [() => this.fetchRepo(url.repoCid), url.repoCid],
      [() => this.fetchBranchHead(url.branch), url.branch],
      [commit => this.fetchPath(this.urlPath, commit), urlPath],
      [() => this.fetchReadme(), urlPath]
    ])
  }

  render() {
    const pathname = this.props.location.pathname
    const url = Url.parseRepoPath(pathname)

    let content
    if (url.gitType === 'blob') {
      content = <FileContent content={this.state.data} path={pathname} />
    } else {
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

  async fetchRepo(repoCid) {
    const repo = await GitRepo.fetch(repoCid)
    this.setState({ repo })
  }

  async fetchBranchHead(branch) {
    let object = await this.state.repo.refCommit(branch)
    if(object instanceof GitTag) {
      object = await object.taggedObject()
    }
    return object
  }

  async fetchPath(pathname, commit) {
    const url = Url.parseRepoPath(pathname)
    let dagPath = `${commit.cid}/tree`
    if (url.filePathParts.length) {
      dagPath += '/' + url.filePathParts.join('/hash/') + '/hash'
    }
    const data = await this.state.repo.getObject(dagPath)
    this.setState({ data, commit })
  }

  // If there's a README.md file in the tree,
  // fetch its contents and render
  async fetchReadme() {
    const tree = this.state.data
    if (!tree || !(tree instanceof GitTree)) return

    const readme = tree.files.find(f => f.name === 'README.md')
    if (!readme) return

    const blob = await readme.fetchContents()
    this.setState({ readme: blob })
  }
}

export default Repo
