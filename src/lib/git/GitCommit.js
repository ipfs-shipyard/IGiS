import CID from 'cids'
import moment from 'moment'
import Fetcher from '../Fetcher'

const COMMIT_SUMMARY_LEN = 80

class RecursiveCommitFetcher extends Fetcher {
  // Set countRequired to -1 to fetch the entire history
  constructor(repo, cid, countRequired, onUpdate) {
    super()
    this.repo = repo
    this.cid = cid
    this.countRequired = countRequired
    this.onUpdate = onUpdate
    this.count = 0
    this.fetched = {}
    this.queue = []
    this.commits = []
  }

  run() {
    this.fetched[this.cid] = true
    return this.repo.getObject(this.cid).then(c => this.processCommit(c)).then(() => this.commits)
  }

  async processCommit(commit) {
    if (!this.running) return

    this.count++

    // Update the list of fetched commits
    this.commits = this.commits.concat([commit])
    this.onUpdate && this.onUpdate(this.countRequired === -1 ? this.commits : this.commits.slice(0, this.countRequired))

    // If we've collected enough commits, we're done
    if (this.countRequired !== -1 && this.count >= this.countRequired) return this.cancel()

    // Fetch the parents of the commit
    const parentCids = commit.parents.map(p => p.cid).filter(c => !this.fetched[c])
    parentCids.forEach(c => this.fetched[c] = true)
    const parents = await Promise.all(parentCids.map(this.repo.getObject))

    // Add the parents of the commit to the queue and sort the newest commits
    // to the front
    this.queue = this.queue.concat(parents).sort((a, b) => {
      return b.committer.moment.valueOf() - a.committer.moment.valueOf()
    })

    // If there are no more commits to fetch, we're done
    if (!this.queue.length) return this.cancel()

    // Process the newest commit
    const newest = this.queue.shift()
    return this.processCommit(newest)
  }
}

class DiffFetcher extends Fetcher {
  constructor(repo, baseTree, compTree, onUpdate) {
    super()
    this.repo = repo
    this.baseTree = baseTree
    this.compTree = compTree
    this.onUpdate = onUpdate
    this.stateChanges = []
  }

  run() {
    return this.fetchTrees(this.baseTree, this.compTree).then(() => this.stateChanges)
  }

  async fetchTrees(t1, t2, path) {
    if (!this.running) return

    const trees = await Promise.all([
      this.repo.getObject(t1),
      t2 && this.repo.getObject(t2)
    ])

    const changes = this.getChanges(...trees)
    await Promise.all(changes.map(async c => {
      if (!this.running) return

      // If the change is a directory, recursively drill down into the directory
      if (c.change[0] && c.change[0].isDir() && c.change[1] && c.change[1].isDir()) {
        const dirPath = (path ? path + '/' : '') + c.name
        return this.fetchTrees(c.change[0].cid, c.change[1].cid, dirPath)
      }

      // As we retrieve the contents for each change, update
      // the state so the diff is rendered, making sure to keep
      // files in lexicographical order.
      // Note that we don't wait for the contents to load, we just
      // set the change field to be a Promise with the file contents
      const files = Promise.all(c.change.map(f => f && f.fetchContents()))
      this.stateChanges = this.stateChanges.concat({
        path: (path ? path + '/' : '' ) + c.name,
        name: c.name,
        change: files
      }).sort((a, b) => {
        if (a.path < b.path) return -1
        if (a.path > b.path) return 1
        return 0
      })

      if (!this.running) return

      this.onUpdate && this.onUpdate({ changes: this.stateChanges })
    }))
  }

  getChanges(base, comp) {
    function byName(a) {
      const o = {}
      a.forEach(i => o[i.name] = i)
      return o
    }
    const headByName = byName(base.files)
    const parentByName = byName((comp || {}).files || [])
    const fileset = {}
    Object.keys(headByName).forEach(h => {
      fileset[h] = {
        name: h,
        change: [headByName[h], parentByName[h]]
      }
    })
    Object.keys(parentByName).forEach(p => {
      fileset[p] = fileset[p] || {
        name: p,
        change: [undefined, parentByName[p]]
      }
    })
    
    // A change has occurred if
    // - a file was added
    // - a file was deleted
    // - a file's hash has changed
    return Object.values(fileset).filter(c => {
      return !c.change[0] || !c.change[1] || c.change[0].cid !== c.change[1].cid
    })
  }
}

class GitCommit {
  constructor(repo, data, cid) {
    Object.assign(this, data)
    this.repo = repo
    this.cid = cid

    this.author.moment = moment(this.author.date, 'X ZZ')
    this.committer.moment  = moment(this.committer.date, 'X ZZ')

    this.summary = this.message.split('\n')[0]
    if (this.summary.length > COMMIT_SUMMARY_LEN) {
      this.summary = this.summary.substring(0, COMMIT_SUMMARY_LEN) + '...'
    }

    const parents = []
    this.parents.forEach(p => {
      try {
        p.cid = new CID(p['/']).toBaseEncodedString()
        parents.push(p)
      } catch(e) {}
    })
    this.parents = parents
  }

  // Compare this commit's tree to the given commit's tree
  // If a comparison commit is not provided, compare this commit's
  // tree to its parent's tree
  fetchDiff(onUpdate, compCommit) {
    const baseTree = `${this.cid}/tree`
    let compTree
    if (compCommit) {
      compTree = `${compCommit.cid}/tree`
    } else {
      compTree = this.parents.length && `${this.cid}/parents/0/tree`
    }
    return new DiffFetcher(this.repo, baseTree, compTree, onUpdate).start()
  }

  static fetchCommitAndParents(repo, cid, countRequired, onUpdate) {
    return new RecursiveCommitFetcher(repo, cid, countRequired, onUpdate).start()
  }
}

export default GitCommit
