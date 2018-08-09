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
  }

  componentDidMount() {
    super.componentDidMount()

    new RepoCrdt(this.repoCid).onPRListChange(() => {
      const pathname = this.props.location.pathname
      const url = Url.parsePullRequestsPath(pathname)
      // if (url.offsetCid) return // Don't re-render if we're on a different page

      this.triggerFetches(url)
    })
  }

  triggerFetches(url) {
    this.triggerPromises([
      [() => GitRepo.fetch(url.repoCid), url.repoCid, 'repo'],
      [() => this.fetchPullRequests(url.repoCid, url.offsetCid), false, 'prs'],
      [() => this.fetchPullRequestAuthors(url.repoCid, url.offsetCid), false]
    ])
  }

  async fetchPullRequests(repoCid, offsetCid) {
    // Fetch one extra row for pagination purposes
    return new RepoCrdt(repoCid).fetchPRList(offsetCid, this.rowCount + 1)
  }

  async fetchPullRequestAuthors(repoCid, offsetCid) {
    // Multiple prs will have the same author,
    // and users are cached, so split the prs up
    // by author, and then render the authors of all
    // those prs at once
    const prs = this.state.prs
    const byAuthor = {}
    prs.forEach(pr => {
      const authorCid = pr.authorCid.toBaseEncodedString()
      byAuthor[authorCid] = byAuthor[authorCid] || pr
    })

    await Promise.all(Object.keys(byAuthor).map(async authorCid => {
      const prsWithAuthor = prs.filter(pr => pr.authorCid.toBaseEncodedString() === authorCid)
      const fetchAuthors = Promise.all(prsWithAuthor.map(pr => pr.fetchAuthor()))

      // Render each author as it is loaded
      this.runThen(fetchAuthors, () => this.setState({ prs }))
    }))
  }

  pathDidChange(pathname) {
    const url = Url.parsePullRequestsPath(pathname)
    this.triggerFetches(url)
  }

  render() {
    const pathname = this.props.location.pathname
    const url = Url.parsePullRequestsPath(pathname)

    const prs = this.state.prs && this.state.prs.slice(0, this.rowCount)
    const next = (this.state.prs || [])[this.rowCount]
    return (
      <div className="PullRequests">
        <PullRequestList baseUrl={url.basePath} repoCid={url.repoCid} prs={prs} next={next} />
      </div>
    )
  }
}

export default PullRequests
