import CommitTitle from './CommitTitle'
import FileContent from './FileContent'
import GitRepo from '../lib/git/GitRepo'
import GitTree from '../lib/git/GitTree'
import IGComponent from './IGComponent'
import React from 'react'
import Readme from './Readme'
import Ref from '../lib/git/util/Ref'
import RepoLinks from './RepoLinks'
import Tree from './Tree'
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
      [() => GitRepo.fetch(url.repoCid), url.repoCid, 'repo'],
      [repo => repo.refHead(url.branch), url.branch, 'commit'],
      [commit => this.fetchPath(this.urlPath, commit), urlPath, 'data'],
      [data => this.fetchReadme(data), urlPath, 'readme']
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

    const defaultBranch = url.branch || Ref.refNick((this.state.repo || {}).defaultBranch)
    return (
      <div className="Repo">
        <RepoLinks repo={this.state.repo} url={url} branch={defaultBranch} />
        <CommitTitle commit={this.state.commit} />
        {content}
      </div>
    )
  }

  async fetchPath(pathname, commit) {
    const url = Url.parseRepoPath(pathname)
    let dagPath = `${commit.cid}/tree`
    if (url.filePathParts.length) {
      dagPath += '/' + url.filePathParts.join('/hash/') + '/hash'
    }
    return this.state.repo.getObject(dagPath)
  }

  // If there's a README.md file in the tree,
  // fetch its contents and render
  async fetchReadme(tree) {
    if (!tree || !(tree instanceof GitTree)) return

    const readme = tree.files.find(f => f.name === 'README.md')
    if (!readme) return

    return readme.fetchContents()
  }
}

export default Repo
