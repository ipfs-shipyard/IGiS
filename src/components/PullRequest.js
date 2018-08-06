import Avatar from './Avatar'
import CommentList from './CommentList'
import CommitList from './CommitList'
import CommitDiffList from './CommitDiffList'
import GitRepo from '../lib/git/GitRepo'
import NewCommentForm from './NewCommentForm'
import React, { Component } from 'react'
import Ref from '../lib/git/util/Ref'
import { RepoCrdt, PullRequest as PullRequestCrdt, User as UserCrdt } from '../lib/crdt/CRDT'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import Url from '../lib/Url'
import Username from './Username'

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
    this.prCid = url.prCid
  }

  componentDidMount() {
    this.triggerFetch()
  }

  async triggerFetch() {
    new RepoCrdt(this.repoCid).onPRCommentsChange(this.prCid, comments => {
      this.setState({ comments }, () => this.fetchCommentAuthors())
    })

    await Promise.all([
      this.fetchLoggedInUser(),
      this.fetchRepo(this.repoCid),
      this.fetchPullRequest()
    ])
    await Promise.all([
      (async () => {
        await this.fetchComments()
        await this.fetchCommentAuthors()
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
        <h4>
          {this.state.pr ? this.state.pr.name : <span className="Loading" />}
        </h4>
        <div className="pr-author">
          <Avatar user={(this.state.pr || {}).author} />
          <Username user={(this.state.pr || {}).author} />
        </div>
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
            { !!this.state.comments && (
              <NewCommentForm author={this.state.loggedInUser} repoCid={this.repoCid} prCid={this.prCid} />
            )}
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

  async fetchLoggedInUser() {
    const loggedInUser = await UserCrdt.loggedInUser()
    this.setState({ loggedInUser })
  }

  async fetchRepo(repoCid) {
    const repo = await GitRepo.fetch(repoCid)
    this.setState({ repo })
  }

  async fetchPullRequest() {
    const pr = await PullRequestCrdt.fetch(this.prCid)
    this.setState({ pr })

    await pr.fetchAuthor()
    this.setState({ pr })
  }

  async fetchComments() {
    const comments = await new RepoCrdt(this.repoCid).fetchPRComments(this.prCid)
    this.setState({ comments })
  }

  async fetchCommentAuthors() {
    // Multiple comments will have the same author,
    // and users are cached, so split the comments up
    // by author, and then render the authors of all
    // those comments at once
    const comments = this.state.comments
    const byAuthor = {}
    comments.forEach(c => {
      const authorCid = c.authorCid.toBaseEncodedString()
      byAuthor[authorCid] = byAuthor[authorCid] || c
    })

    return Promise.all(Object.keys(byAuthor).map(async authorCid => {
      const commentsWithAuthor = comments.filter(c => c.authorCid.toBaseEncodedString() === authorCid)
      await Promise.all(commentsWithAuthor.map(c => c.fetchAuthor()))
      this.setState({ comments: this.state.comments })
    }))
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
