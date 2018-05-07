import React, { Component } from 'react'
import CommitList from "./CommitList"
import GitCommit from '../lib/git/GitCommit'
import GitRepo from '../lib/git/GitRepo'
import { Link } from 'react-router-dom'
import Url from '../lib/Url'
import GitTag from '../lib/git/GitTag'

class Commits extends Component {
  constructor(props) {
    super(props)
    this.rowCount = 20
    this.state = { commits: [] }
  }

  render() {
    const pathname = this.props.location.pathname
    const url = Url.parseCommitsPath(pathname)

    // If we have not yet fetched the data for the commit list, continue with
    // rendering but trigger a fetch in the background (which will
    // call render again on completion)
    this.triggerFetch(url.repoCid, url.branch, url.commitCid)

    // If there is another commit in the list, show the more link
    let more = null
    if (this.state.commits.length > this.rowCount) {
      const nextCommit = this.state.commits[this.rowCount]
      more = <Link to={`${url.basePath}/${nextCommit.cid}`}>More ▾</Link>
    }

    return (
      <div className="Commits">
        <CommitList repoCid={url.repoCid} commits={this.state.commits.slice(0, this.rowCount)} />
        <div className="more-link">
          {more}
        </div>
      </div>
    )
  }

  async triggerFetch(repoCid, branch, commitCid) {
    if (this.repoFetched) {
      this.triggerCommitsFetch(branch, commitCid)
      return
    }
    this.repoFetched = true

    // Get the repo
    return GitRepo.fetch(repoCid).then(repo => {
      this.setState({ repo })
      this.triggerCommitsFetch(branch, commitCid)
    })
  }

  async triggerCommitsFetch(branch, commitCid) {
    commitCid = commitCid || await this.branchHead(branch)
    if (!commitCid) return

    // Check if we're already processing this commit
    if ((this.currentCommit || {}).cid === commitCid) return

    // If we were fetching another commit, cancel it
    if ((this.currentCommit || {}).fetch) {
      this.currentCommit.fetch.cancel()
    }
    this.currentCommit = {
      cid: commitCid
    }

    // Fetch one extra row for pagination purposes
    const rowCount = this.rowCount + 1
    this.currentCommit.fetch = GitCommit.fetchCommitAndParents(commitCid, rowCount, commits => {
      this.setState({ commits })
    })
  }

  async branchHead(branch) {
    let object = await this.state.repo.refCommit(branch)
    if(object instanceof GitTag)
      object = await object.taggedObject()
    return object.cid
  }
}

export default Commits
