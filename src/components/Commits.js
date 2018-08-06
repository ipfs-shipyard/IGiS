import React from 'react'
import CommitList from './CommitList'
import GitCommit from '../lib/git/GitCommit'
import GitRepo from '../lib/git/GitRepo'
import IGComponent from './IGComponent'
import { Link } from 'react-router-dom'
import Url from '../lib/Url'

class Commits extends IGComponent {
  constructor(props) {
    super(props)
    this.rowCount = 20
    this.state = { commits: [] }
  }

  pathDidChange(urlPath) {
    const pathname = this.props.location.pathname
    const url = Url.parseCommitsPath(pathname)

    // Fetch the repo and the commit list. Note that
    // each will update the state, triggering a new render
    this.triggerPromises([
      [() => GitRepo.fetch(url.repoCid), url.repoCid, 'repo'],
      [repo => this.fetchCommits(repo, url.branch, url.commitCid), false, 'complete']
    ])
  }

  render() {
    const pathname = this.props.location.pathname
    const url = Url.parseCommitsPath(pathname)

    // If there is another commit in the list, show the more link
    let more = null
    if (this.state.commits.length > this.rowCount) {
      const nextCommit = this.state.commits[this.rowCount]
      more = <div className="more-link"><Link to={`${url.basePath}/${nextCommit.cid}`}>More ▾</Link></div>
    }

    return (
      <div className="Commits">
        <CommitList repoCid={url.repoCid} commits={this.state.commits.slice(0, this.rowCount)} />
        {more}
      </div>
    )
  }

  async fetchCommits(repo, branch, commitCid) {
    commitCid = commitCid || (await repo.refHead(branch)).cid
    if (!commitCid) return

    // Render the loading state while we fetch the commits on this page
    this.currentCommit = commitCid
    this.setState({ commits: [] })

    // Fetch one extra row for pagination purposes
    const rowCount = this.rowCount + 1
    return GitCommit.fetchCommitAndParents(repo, commitCid, rowCount, commits => this.setState({ commits }))
  }
}

export default Commits
