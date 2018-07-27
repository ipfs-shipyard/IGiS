import React from 'react'
import CommitList from "./CommitList"
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

  render() {
    const pathname = this.props.location.pathname
    const url = Url.parseCommitsPath(pathname)

    // Fetch the repo and the commit list. Note that
    // each will update the state, triggering a new render
    this.triggerPromises([
      [() => this.fetchRepo(url.repoCid), url.repoCid],
      [() => this.fetchCommits(url.branch, url.commitCid), url.branch + '-' + url.commitCid, false]
    ])

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
        {this.renderLoading()}
      </div>
    )
  }

  async fetchRepo(repoCid) {
    const repo = await GitRepo.fetch(repoCid)
    this.setState({ repo })
  }

  async fetchCommits(branch, commitCid) {
    commitCid = commitCid || await this.state.repo.refHead(branch)
    if (!commitCid) return

    // If we were fetching another commit, cancel it
    if ((this.currentCommit || {}).fetch) {
      this.currentCommit.fetch.cancel()
    }
    this.currentCommit = {
      cid: commitCid
    }

    // Fetch one extra row for pagination purposes
    const rowCount = this.rowCount + 1
    this.currentCommit.fetch = GitCommit.fetchCommitAndParents(this.state.repo, commitCid, rowCount, commits => {
      this.setState({ commits })
    }).then(() => this.setState({ complete: commitCid }))
  }

  renderLoading() {
    if (this.state.complete === (this.currentCommit || {}).cid) return null

    this.loadingLengths = this.loadingLengths || [...Array(this.rowCount)].map(() => [
      7.4, 15 + Math.random() * 10, 4 + Math.random() * 2
    ])
    const lengths = this.loadingLengths.slice(this.state.commits.length)
    return (
      <div className={ "Loading" + (this.state.commits.length ? '' : ' no-commits') }>
        {lengths.map((item, i) => (
          <div className="item" key={i}>
            {item.map((l, j) => (
              <div key={j} style={{width: l + 'em'}} />
            ))}
          </div>
        ))}
        <div className="more-link" key={lengths.length}>
          <div />
        </div>
      </div>
    )
  }
}

export default Commits
