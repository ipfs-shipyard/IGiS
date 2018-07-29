import React from 'react'
import PullRequestList from "./PullRequestList"
import GitRepo from '../lib/git/GitRepo'
import IGComponent from './IGComponent'
import { RepoCrdt } from '../lib/crdt/CRDT'
import Url from '../lib/Url'

class PullRequests extends IGComponent {
  constructor(props) {
    super(props)
    this.rowCount = 2
    this.state = {}
  }

  render() {
    const pathname = this.props.location.pathname
    const url = Url.parsePullRequestsPath(pathname)

    // Fetch the repo and the commit list. Note that
    // each will update the state, triggering a new render
    this.triggerPromises([
      [() => this.fetchRepo(url.repoCid), url.repoCid],
      [() => this.fetchPullRequests(url.repoCid, url.offsetCid), url.offsetCid],
      [() => this.fetchPullRequestAuthors(url.repoCid, url.offsetCid), url.offsetCid]
    ])

    const prs = this.state.prs && this.state.prs.slice(0, this.rowCount)
    const next = (this.state.prs || [])[this.rowCount]
    return (
      <div className="PullRequests">
        <PullRequestList baseUrl={url.basePath} repoCid={url.repoCid} prs={prs} next={next} />
      </div>
    )
  }

  async fetchRepo(repoCid) {
    const repo = await GitRepo.fetch(repoCid)
    this.setState({ repo })
  }

  async fetchPullRequests(repoCid, offsetCid) {
    // If we were fetching another PR, cancel it
    this.prFetch && this.prFetch.cancel()

    // If it takes more than a short time to fetch the PRs then
    // clear the PR list so that the loading screen is displayed
    let fetchComplete = false
    setTimeout(() => !fetchComplete && this.setState({ prs: undefined }), 100)

    // Fetch one extra row for pagination purposes
    this.prFetch = new RepoCrdt(repoCid).fetchPRList(offsetCid, this.rowCount + 1)
    const prs = await this.prFetch
    fetchComplete = true
    this.setState({ prs })
  }

  async fetchPullRequestAuthors(repoCid, offsetCid) {
    return Promise.all(this.state.prs.map(async pr => {
      await pr.fetchAuthor()
      this.setState({ prs: this.state.prs })
    }))
  }
}

export default PullRequests
