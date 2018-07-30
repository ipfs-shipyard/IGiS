import React from 'react'
import Button from './Button'
import CommitList from './CommitList'
import CommitDiffList from './CommitDiffList'
import GitRepo from '../lib/git/GitRepo'
import NewPullRequestForm from './NewPullRequestForm'
import IGComponent from './IGComponent'
import Url from '../lib/Url'

class Compare extends IGComponent {
  constructor(props) {
    super(props)
    this.state = {
      commitsFetchComplete: false,
      commits: []
    }
  }

  render() {
    const pathname = this.props.location.pathname
    const url = Url.parseComparePath(pathname)

    // Fetch the repo, the commit list and then the diff. Note that
    // each will update the state, triggering a new render
    this.triggerPromises([
      [() => this.fetchRepo(url.repoCid), url.repoCid],
      [() => this.fetchCommits(url.branches), url.branches.join('-')],
      [() => this.fetchDiff(), url.branches.join('-')]
    ])

    const cannotCompare = this.state.commitsFetchComplete && !this.state.commits.length
    const prefix = cannotCompare ? 'Cannot compare' : 'Comparing'
    return (
      <div className="Compare">
        <p>
          {prefix} base <b>{url.branches[0]}</b> to <b>{url.branches[1]}</b>
          {!!this.state.message && ' (' + this.state.message + ')'}
        </p>
        { !this.state.showNewPR && !!(this.state.commits || []).length && (
          <Button className="pull-request" isLink={true} onClick={() => this.setState({ showNewPR: true })}>
            New Pull Request
          </Button>
        )}
        { this.state.showNewPR && (
          <NewPullRequestForm repoCid={url.repoCid} branches={url.branches} onCancel={() => this.setState({ showNewPR: false })} />
        )}
        <CommitList repoCid={url.repoCid} commits={this.state.commits} />
        { !cannotCompare && <CommitDiffList changes={this.state.changes} /> }
      </div>
    )
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

export default Compare
