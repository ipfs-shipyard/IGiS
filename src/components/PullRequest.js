import React, { Component } from 'react'
import CommentList from './CommentList'
import CommitList from './CommitList'
import CommitDiffList from './CommitDiffList'
import GitRepo from '../lib/git/GitRepo'
import Ref from '../lib/git/util/Ref'
import { RepoCrdt } from '../lib/crdt/CRDT'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import Url from '../lib/Url'

class PullRequest extends Component {
  constructor(props) {
    super(props)
    this.state = {
      commitsFetchComplete: false,
      commits: []
    }
    const pathname = this.props.location.pathname
    const url = Url.parsePullRequestPath(pathname)
    this.repoCid = url.repoCid
    this.pullCid = url.pullCid
  }

  componentDidMount() {
    this.triggerFetch()
  }

  async triggerFetch() {
    await Promise.all([
      this.fetchRepo(this.repoCid),
      this.fetchPullRequest(this.pullCid)
    ])
    await Promise.all([
      (async () => {
        await this.fetchComments(this.repoCid, this.pullCid)
        await this.fetchCommentAuthors(this.repoCid, this.pullCid)
      })(),
      (async () => {
        await this.fetchCommits()
        await this.fetchDiff()
      })()
    ])
  }

  getBranches() {
    if (!this.state.pr) return

    return [this.state.pr.base.ref, this.state.pr.compare.ref].map(Ref.refNick)
  }

  render() {
    const branches = this.getBranches()
    const cannotCompare = this.state.commitsFetchComplete && !this.state.commits.length
    const prefix = cannotCompare ? 'Cannot compare' : 'Comparing'
    return (
      <div className="PullRequest">
        <p>
          { branches ? (
            <span>
              {prefix} base <b>{branches[0]}</b> to <b>{branches[1]}</b>
              {!!this.state.message && ' (' + this.state.message + ')'}
            </span>
          ) : (
            <span className="Loading" />
          )}
        </p>
        <Tabs>
          <TabList>
            <Tab>Comments</Tab>
            <Tab>Commits</Tab>
            <Tab>Changes</Tab>
          </TabList>

          <TabPanel>
            <CommentList comments={this.state.comments} />
          </TabPanel>
          <TabPanel>
            <CommitList repoCid={this.repoCid} commits={this.state.commits} />
          </TabPanel>
          <TabPanel>
            { !cannotCompare && <CommitDiffList changes={this.state.changes} /> }
          </TabPanel>
        </Tabs>
      </div>
    )
  }

  async fetchComments(repoCid, pullCid) {
    const comments = await new RepoCrdt(repoCid).fetchPRComments(pullCid)
    this.setState({ comments })
  }

  async fetchCommentAuthors() {
    this.state.comments.forEach(async c => {
      await c.fetchAuthor()
      this.setState({ comments: this.state.comments })
    })
  }

  async fetchRepo(repoCid) {
    const repo = await GitRepo.fetch(repoCid)
    this.setState({ repo })
  }

  async fetchPullRequest(pullCid) {
    const pr = await window.ipfs.dag.get(pullCid).then(r => r.value)
    this.setState({ pr })
  }

  async fetchCommits() {
    return this.state.repo.fetchCommitComparison(this.getBranches(), this.setState.bind(this))
  }

  async fetchDiff() {
    // Wait till all changes have been fetched then render the results
    // (rather than rendering them as they come in, which causes the page
    // to jump around)
    if (!this.state.commits[0]) return

    const changes = await this.state.commits[0].fetchDiff(null, this.state.intersectCommit)
    this.setState({ changes })
  }
}

export default PullRequest
