import React from 'react'
import PullRequestList from "./PullRequestList"
import GitRepo from '../lib/git/GitRepo'
import IGComponent from './IGComponent'
import { RepoCrdt } from '../lib/crdt/CRDT'
import Url from '../lib/Url'

class PullRequests extends IGComponent {
  constructor(props) {
    super(props)
    this.rowCount = 20
    this.state = {}

    const pathname = props.location.pathname
    const url = Url.parsePullRequestsPath(pathname)
    this.repoCid = url.repoCid
  }

  componentDidMount() {
    this.triggerFetch()
  }

  async triggerFetch() {
    await Promise.all([
      this.fetchRepo(this.repoCid),
      (async () => {
        await this.fetchPullRequests(this.repoCid)
        await this.fetchPullRequestAuthors()
      })()
    ])
  }

  render() {
    const pathname = this.props.location.pathname
    const url = Url.parsePullRequestsPath(pathname)

    // TODO: move to PullRequestList
    // If there is another pr in the list, show the more link
    // let more = null
    // if ((this.state.prs || []).length > this.rowCount) {
    //   const nextPullRequest = this.state.prs[this.rowCount]
    //   more = <div className="more-link"><Link to={`${url.basePath}/${nextPullRequest.cid}`}>More ▾</Link></div>
    // }

    return (
      <div className="PullRequests">
        <PullRequestList repoCid={url.repoCid} prs={this.state.prs && this.state.prs.slice(0, this.rowCount)} />
      </div>
    )
  }

  async fetchRepo(repoCid) {
    const repo = await GitRepo.fetch(repoCid)
    this.setState({ repo })
  }

  async fetchPullRequests(repoCid) {
    const prs = await new RepoCrdt(repoCid).fetchPRList()
    this.setState({ prs })
  }

  fetchPullRequestAuthors() {
    return Promise.all(this.state.prs.map(async pr => {
      await pr.fetchAuthor()
      this.setState({ prs: this.state.prs })
    }))
  }
}

export default PullRequests
