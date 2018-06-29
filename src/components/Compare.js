import React from 'react'
import CommitList from "./CommitList"
import CommitDiffList from "./CommitDiffList"
import GitCommit from '../lib/git/GitCommit'
import GitRepo from '../lib/git/GitRepo'
import IGComponent from './IGComponent'
import Url from '../lib/Url'
import GitTag from '../lib/git/GitTag'

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

    const prefix = this.state.commitsFetchComplete && !this.state.commits.length ? 'Cannot compare' : 'Comparing'
    return (
      <div className="Compare">
        <p>
          {prefix} base <b>{url.branches[0]}</b> to <b>{url.branches[1]}</b>
          {!!this.state.message && ' (' + this.state.message + ')'}
        </p>
        { this.state.commits.length > 0 ? (
          <CommitList repoCid={url.repoCid} commits={this.state.commits} />
        ) : (
          this.renderLoadingCommitList()
        )}
        <CommitDiffList changes={this.state.changes} />
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
      return this.setState({ commitsFetchComplete: true, message: 'same branch head' })
    }

    return new Promise((resolve, reject) => {
      // Start fetching the commit list for each branch, comparing
      // the lists each time a new commit is fetched
      let state
      function resolvePromise() {
        resolve && resolve(state)
        resolve = null
      }

      let fetches = []
      let completeCount = 0
      const onComplete = () => {
        completeCount++
        if (completeCount > 1) {
          // When the fetches have completed, clean up and render
          fetches.forEach(f => f.cancel())
          this.setState({ commitsFetchComplete: true })
          resolvePromise()
        }
      }

      let baseCommits = []
      let compCommits = []
      const compare = () => {
        let state = this.compareBranchCommits(baseCommits, compCommits)
        if (state.commitsFetchComplete) {
          fetches.forEach(f => f.cancel())
        }
        this.setState(state)
        if (state.commitsFetchComplete) {
          resolvePromise()
        }
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
        GitCommit.fetchCommitAndParents(this.state.repo, branchHeads[0], -1, onBaseUpdate),
        GitCommit.fetchCommitAndParents(this.state.repo, branchHeads[1], -1, onCompUpdate)
      ]
      fetches.forEach(f => f.then(onComplete))
    })
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
          intersectCommit: c,
          commits: compCommits.slice(0, i),
          commitsFetchComplete: true
        }
      }
    }
    return {
      commits: [],
      commitsFetchComplete: false
    }
  }

  async branchHead(branch) {
    let object = await this.state.repo.refCommit(branch)
    if(object instanceof GitTag)
      object = await object.taggedObject()
    return object.cid
  }

  async fetchDiff() {
    // Wait till all changes have been fetched then render the results
    // (rather than rendering them as they come in, which causes the page
    // to jump around)
    return this.state.commits[0].fetchDiff(null, this.state.intersectCommit).then(async changes => {
      this.setState({ changes })
    })
  }

  renderLoadingCommitList() {
    this.loadingLengths = this.loadingLengths || [...Array(3)].map(() => [
      7.4, 15 + Math.random() * 10, 4 + Math.random() * 2
    ])
    const lengths = this.loadingLengths.slice(this.state.commits.length)
    return (
      <div className={ "CommitListLoading" + (this.state.commits.length ? '' : ' no-commits') }>
        {lengths.map((item, i) => (
          <div className="item" key={i}>
            {item.map((l, j) => (
              <div key={j} style={{width: l + 'em'}} />
            ))}
          </div>
        ))}
      </div>
    )
  }
}

export default Compare
