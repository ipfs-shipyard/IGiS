import GitCommit from '../GitCommit'

class CommitCompare {
  constructor(repo, refNicks) {
    this.repo = repo
    this.refNicks = refNicks
  }

  async fetchComparison(onUpdate) {
    // Fetch the head commit on the base branch and the comparison branch
    const refHeads = await Promise.all(this.refNicks.map(b => this.repo.refHead(b)))
    if (refHeads[0] === refHeads[1]) {
      return onUpdate({ commitsFetchComplete: true, message: 'same branch head' })
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
          onUpdate({ commitsFetchComplete: true })
          resolvePromise()
        }
      }

      let baseCommits = []
      let compCommits = []
      const compare = () => {
        let state = CommitCompare.compareRefCommits(baseCommits, compCommits)
        if (state.commitsFetchComplete) {
          fetches.forEach(f => f.cancel())
        }
        onUpdate(state)
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
        GitCommit.fetchCommitAndParents(this.repo, refHeads[0], -1, onBaseUpdate),
        GitCommit.fetchCommitAndParents(this.repo, refHeads[1], -1, onCompUpdate)
      ]
      fetches.forEach(f => f.then(onComplete))
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
