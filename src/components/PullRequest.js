import React, { Component } from 'react'
import CommentList from './CommentList'
import CommitList from './CommitList'
import CommitDiffList from './CommitDiffList'
import GitCommit from '../lib/git/GitCommit'
import GitRepo from '../lib/git/GitRepo'
import GitTag from '../lib/git/GitTag'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import Url from '../lib/Url'
import { Repo as RepoCrdt } from '../lib/crdt/CRDT'

class PullRequest extends Component {
  constructor(props) {
    super(props)
    this.state = {
      commitsFetchComplete: false,
      commits: []
    }
    // TODO: Get these from a PR object
    this.branches = ['master', 'feat/coreapi/swarm']
    const pathname = this.props.location.pathname
    this.url = Url.parsePullRequestPath(pathname)
  }

  componentDidMount() {
    this.triggerFetch()
  }

  async triggerFetch() {
    await this.fetchRepo(this.url.repoCid)
    await Promise.all([
      (async () => {
        await this.fetchComments(this.url.repoCid, this.url.pullCid)
        await this.fetchCommentAuthors(this.url.repoCid, this.url.pullCid)
      })(),
      (async () => {
        await this.fetchCommits(this.branches)
        await this.fetchDiff()
      })()
    ])
  }

  render() {
    const cannotCompare = this.state.commitsFetchComplete && !this.state.commits.length
    const prefix = cannotCompare ? 'Cannot compare' : 'Comparing'
    return (
      <div className="PullRequest">
        <p>
          {prefix} base <b>{this.branches[0]}</b> to <b>{this.branches[1]}</b>
          {!!this.state.message && ' (' + this.state.message + ')'}
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
            <CommitList repoCid={this.url.repoCid} commits={this.state.commits} />
          </TabPanel>
          <TabPanel>
            { !cannotCompare && <CommitDiffList changes={this.state.changes} /> }
          </TabPanel>
        </Tabs>
      </div>
    )
  }

  async fetchComments(repoCid, pullCid) {
    this.prCrdt = new RepoCrdt(repoCid).pullRequest(pullCid)
    const comments = await this.prCrdt.fetchComments()
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

  async fetchCommits(branches) {
    return this.state.repo.fetchCommitComparison(branches, this.setState.bind(this))
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
