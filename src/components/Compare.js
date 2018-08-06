import React from 'react'
import Button from './Button'
import CommitList from './CommitList'
import CommitDiffList from './CommitDiffList'
import IGComponent from './IGComponent'
import GitRepo from '../lib/git/GitRepo'
import NewPullRequestForm from './NewPullRequestForm'
import Url from '../lib/Url'

class Compare extends IGComponent {
  constructor(props) {
    super(props)
    this.state = {
      commitsFetchComplete: false,
      commits: []
    }

    const pathname = this.props.location.pathname
    const url = Url.parseComparePath(pathname)
    this.repoCid = url.repoCid
    this.branches = url.branches
  }

  componentDidMount() {
    this.triggerPromises([
      [() => GitRepo.fetch(this.repoCid), false, 'repo'],
      [() => this.fetchCommits(this.branches), false],
      [() => this.fetchDiff(), false, 'changes']
    ])
  }

  render() {
    const cannotCompare = this.state.commitsFetchComplete && !this.state.commits.length
    const prefix = cannotCompare ? 'Cannot compare' : 'Comparing'
    return (
      <div className="Compare">
        <p>
          {prefix} base <b>{this.branches[0]}</b> to <b>{this.branches[1]}</b>
          {!!this.state.message && ' (' + this.state.message + ')'}
        </p>
        { !this.state.showNewPR && !!(this.state.commits || []).length && (
          <Button className="pull-request" isLink={true} onClick={() => this.setState({ showNewPR: true })}>
            New Pull Request
          </Button>
        )}
        { this.state.showNewPR && (
          <NewPullRequestForm repoCid={this.repoCid} branches={this.branches} onCancel={() => this.setState({ showNewPR: false })} />
        )}
        <CommitList repoCid={this.repoCid} commits={this.state.commits} />
        { !cannotCompare && <CommitDiffList changes={this.state.changes} /> }
      </div>
    )
  }

  async fetchCommits() {
    return this.state.repo.fetchCommitComparison(this.branches, this.setState.bind(this))
  }

  async fetchDiff() {
    // Wait till all changes have been fetched then render the results
    // (rather than rendering them as they come in, which causes the page
    // to jump around)
    if (!this.state.commits[0]) return

    return this.state.commits[0].fetchDiff(null, this.state.intersectCommit)
  }
}

export default Compare
