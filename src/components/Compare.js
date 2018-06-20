import React from 'react'
import CommitList from "./CommitList"
import GitCommit from '../lib/git/GitCommit'
import GitRepo from '../lib/git/GitRepo'
import IGComponent from './IGComponent'
import Url from '../lib/Url'
import GitTag from '../lib/git/GitTag'

class Compare extends IGComponent {
  constructor(props) {
    super(props)
    this.state = {
      completed: false,
      commits: []
    }
  }

  render() {
    const pathname = this.props.location.pathname
    const url = Url.parseComparePath(pathname)

    // Fetch the repo and the commit list. Note that
    // each will update the state, triggering a new render
    this.triggerPromises([
      [() => this.fetchRepo(url.repoCid), url.repoCid],
      [() => this.fetchCommits(url.branches), url.branches.join('-')]
    ])

    const prefix = this.state.completed && !this.state.commits.length ? 'Cannot compare' : 'Comparing'
    return (
      <div className="Compare">
        <p>
          {prefix} base <b>{url.branches[0]}</b> to <b>{url.branches[1]}</b>
          {!!this.state.message && ' (' + this.state.message + ')'}
        </p>
        { this.state.commits.length > 0 && (
          <CommitList repoCid={url.repoCid} commits={this.state.commits} />
        )}
      </div>
    )
  }

  async fetchRepo(repoCid) {
    const repo = await GitRepo.fetch(repoCid)
    this.setState({ repo })
  }

  async fetchCommits(branches) {
    // Fetch the head commit on the base branch and the comparison branch
    const branchHeads = await Promise.all(branches.map(this.branchHead.bind(this)))
    if (branchHeads[0] === branchHeads[1]) {
      return this.setState({ completed: true, message: 'same branch head' })
    }

    // Start fetching the commit list for each branch, comparing
    // the lists each time a new commit is fetched
    let fetches = []
    let completeCount = 0
    const onComplete = () => {
      completeCount++
      if (completeCount > 1) {
        // When the fetches have completed, clean up and render the
        // completed state
        fetches.forEach(f => f.cancel())
        this.setState({ completed: true })
      }
    }

    let baseCommits = []
    let compCommits = []
    const compare = () => {
      const state = this.compareBranchCommits(baseCommits, compCommits)
      if (state.completed) {
        fetches.forEach(f => f.cancel())
      }
      this.setState(state)
    }

    function onBaseUpdate(cs) {
      baseCommits = cs
      compare()
    }
    function onCompUpdate(cs) {
      compCommits = cs
      compare()
    }
    fetches = [
      GitCommit.fetchCommitAndParents(this.state.repo, branchHeads[0], -1, onBaseUpdate, onComplete),
      GitCommit.fetchCommitAndParents(this.state.repo, branchHeads[1], -1, onCompUpdate, onComplete)
    ]
  }

  compareBranchCommits(baseCommits, compCommits) {
    // Keep a list of CIDs of commits on the base branch
    const baseCommitMap = {}
    baseCommits.forEach(c => baseCommitMap[c.cid] = true)

    // Walk through the comparison branch commit list
    // until we find an intersection with the base branch
    for (let i = 0; i < compCommits.length; i++) {
      const c = compCommits[i]
      if (baseCommitMap[c.cid]) {
        return {
          commits: compCommits.slice(0, i),
          completed: true
        }
      }
    }
    return {
      commits: [],
      completed: false
    }
  }

  async branchHead(branch) {
    let object = await this.state.repo.refCommit(branch)
    if(object instanceof GitTag)
      object = await object.taggedObject()
    return object.cid
  }
}

export default Compare
