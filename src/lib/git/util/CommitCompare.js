import Fetcher from '../../Fetcher'
import GitCommit from '../GitCommit'

class CommitCompare extends Fetcher {
  constructor(repo, refNicks, onUpdate) {
    super()
    this.repo = repo
    this.refNicks = refNicks
    this.onUpdate = onUpdate
  }

  cancelFetches() {
    this.fetches && this.fetches.forEach(f => f.cancel())
  }

  async run() {
    // Fetch the head commit on the base branch and the comparison branch
    const refHeads = await Promise.all(this.refNicks.map(b => this.repo.refHead(b).then(o => o.cid)))
    if (refHeads[0] === refHeads[1]) {
      return this.onUpdate({ commitsFetchComplete: true, message: 'same branch head' })
    }

    return new Promise((resolve, reject) => {
      // Start fetching the commit list for each branch, comparing
      // the lists each time a new commit is fetched
      function resolvePromise(state = {}) {
        resolve && resolve(state)
        resolve = null
      }

      let completeCount = 0
      const onComplete = () => {
        if (!this.running) {
          return resolvePromise()
        }

        completeCount++
        if (completeCount > 1) {
          // When the fetches have completed, clean up and render
          this.cancelFetches()
          const completeState = { commitsFetchComplete: true }
          this.onUpdate && this.onUpdate(completeState)
          resolvePromise(completeState)
        }
      }

      let baseCommits = []
      let compCommits = []
      const compare = () => {
        let state = CommitCompare.compareRefCommits(baseCommits, compCommits)
        if (state.commitsFetchComplete) {
          this.cancelFetches()
        }
        this.onUpdate && this.onUpdate(state)
        if (state.commitsFetchComplete) {
          resolvePromise(state)
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

      if (!this.running) return onComplete()

      this.fetches = [
        GitCommit.fetchCommitAndParents(this.repo, refHeads[0], -1, onBaseUpdate),
        GitCommit.fetchCommitAndParents(this.repo, refHeads[1], -1, onCompUpdate)
      ]
      this.fetches.forEach(f => f.then(onComplete))
    })
  }

  static compareRefCommits(baseCommits, compCommits) {
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
}

export default CommitCompare
