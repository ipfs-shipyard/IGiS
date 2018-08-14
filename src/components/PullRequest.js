import Avatar from './Avatar'
import CommentList from './CommentList'
import CommitList from './CommitList'
import CommitDiffList from './CommitDiffList'
import GitRepo from '../lib/git/GitRepo'
import IGComponent from './IGComponent'
import NewCommentForm from './NewCommentForm'
import React from 'react'
import Ref from '../lib/git/util/Ref'
import { RepoCrdt, PullRequest as PullRequestCrdt, User as UserCrdt } from '../lib/crdt/CRDT'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import Url from '../lib/Url'
import Username from './Username'

class PullRequest extends IGComponent {
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
    super.componentDidMount()
    new RepoCrdt(this.repoCid).onPRCommentsChange(this.prCid, () => this.triggerFetches())
    this.triggerFetches()
  }

  triggerFetches() {
    const prCacheKey = this.repoCid + '-' + this.prCid
    this.triggerPromises([
      {
        // parallel
        'user': [() => UserCrdt.loggedInUser(), 'loggedInUser', 'loggedInUser'],
        'repo': [() => GitRepo.fetch(this.repoCid), this.repoCid, 'repo'],
        'pr': [
          // sequential
          [() => PullRequestCrdt.fetch(this.prCid), this.prCid, 'pr'],
          [pr => pr.fetchAuthor().then(() => pr), this.prCid, pr => this.setState({ pr })]
        ]
      },
      {
        // parallel
        'comments': [
          // sequential
          [() => new RepoCrdt(this.repoCid).fetchPRComments(this.prCid), false, 'comments'],
          [comments => this.fetchCommentAuthors(comments), false]
        ],
        'commits': [
          // sequential
          [(_, collected) => collected[0].repo.fetchCommitComparison(this.getBranches()), prCacheKey, this.setState.bind(this)],
          [comp => comp.commits[0] && comp.commits[0].fetchDiff(null, this.state.intersectCommit), prCacheKey, 'changes']
        ]
      }
    ])
  }

  async fetchCommentAuthors(comments) {
    if (!comments) return

    // Multiple comments will have the same author,
    // and users are cached, so split the comments up
    // by author, and then render the authors of all
    // those comments at once
    const byAuthor = {}
    comments.forEach(c => {
      const authorCid = c.authorCid.toBaseEncodedString()
      byAuthor[authorCid] = byAuthor[authorCid] || c
    })

    return Promise.all(Object.keys(byAuthor).map(async authorCid => {
      const commentsWithAuthor = comments.filter(c => c.authorCid.toBaseEncodedString() === authorCid)
      const fetchAuthors = Promise.all(commentsWithAuthor.map(c => c.fetchAuthor()))
      this.runThen(fetchAuthors, () => this.setState({ comments }))
    }))
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
}

export default PullRequest
