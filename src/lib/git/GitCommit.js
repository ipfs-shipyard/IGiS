import CID from 'cids'
import moment from 'moment'
import Git from './Git'

const COMMIT_SUMMARY_LEN = 80

class Fetcher {
  start() {
    this.running = true
    return this.run().then(() => this.running = false)
  }
  cancel() {
    this.running = false
  }
}

class RecursiveCommitFetcher extends Fetcher {
  constructor(cid, countRequired, onUpdate) {
    super()
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
    return Git.fetch(this.cid).then(c => this.processCommit(c))
  }

  async processCommit(commit) {
    if (!this.running) return

    this.count++

    // Update the list of fetched commits
    this.commits = this.commits.concat([commit])
    this.onUpdate(this.commits.slice(0, this.countRequired))

    // If we've collected enough commits, we're done
    if (this.count >= this.countRequired) {
      return
    }

    // Fetch the parents of the commit
    const parentCids = commit.parents.map(p => p.cid).filter(c => !this.fetched[c])
    parentCids.forEach(c => this.fetched[c] = true)
    const parents = await Promise.all(parentCids.map(Git.fetch))

    // Add the parents of the commit to the queue and sort the newest commits
    // to the front
    this.queue = this.queue.concat(parents).sort((a, b) => {
      return b.committer.moment.valueOf() - a.committer.moment.valueOf()
    })

    // If there are no more commits to fetch, we're done
    if (!this.queue.length) return

    // Process the newest commit
    const newest = this.queue.shift()
    return this.processCommit(newest)
  }
}

class DiffFetcher extends Fetcher {
  constructor(cid, parents, onUpdate) {
    super()
    this.cid = cid
    this.parents = parents
    this.onUpdate = onUpdate
    this.stateChanges = []
  }

  run() {
    return this.fetchTrees(`${this.cid}/tree`, this.parents.length && `${this.cid}/parents/0/tree`)
  }

  async fetchTrees(t1, t2) {
    if (!this.running) return

    const trees = await Promise.all([
      Git.fetch(t1),
      t2 && Git.fetch(t2)
    ])

    const changes = this.getChanges(...trees)
    await Promise.all(changes.map(async c => {
      if (!this.running) return

      // If the change is a directory, recursively drill down into the directory
      if (c.change[0] && c.change[0].isDir() && c.change[1] && c.change[1].isDir()) {
        return this.fetchTrees(c.change[0].cid, c.change[1].cid)
      }

      // Get the contents of the files
      const files = await Promise.all(c.change.map(f => f && f.fetchContents()))

      // As we retrieve the contents for each change, update
      // the state so the diff is rendered, making sure to keep
      // files in lexicographical order
      this.stateChanges = this.stateChanges.concat({
        name: c.name,
        change: files
      }).sort((a, b) => {
        if (a.name < b.name) return -1
        if (a.name > b.name) return 1
        return 0
      })

      if (!this.running) return

      this.onUpdate({ changes: this.stateChanges })
    }))
  }

  getChanges(head, parent) {
    function byName(a) {
      const o = {}
      a.forEach(i => o[i.name] = i)
      return o
    }
    const headByName = byName(head.files)
    const parentByName = byName((parent || {}).files || [])
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
  constructor(data, cid) {
    Object.assign(this, data)
    this.cid = cid

    this.author.moment = moment(this.author.date, 'X ZZ')
    this.committer.moment  = moment(this.committer.date, 'X ZZ')

    this.summary = this.message.split('\n')[0]
    if (this.summary.length > COMMIT_SUMMARY_LEN) {
      this.summary = this.summary.substring(0, COMMIT_SUMMARY_LEN) + '...'
    }

    const parents = []
    const vp = this.parents || []
    vp.forEach(p => {
      if (!(p || {})['/']) return

      try {
        p.cid = new CID(p['/']).toBaseEncodedString()
        parents.push(p)
      } catch(e) {}
    })
    this.parents = parents
  }

  // Compare this commit's tree to its parent tree
  fetchDiff(onUpdate) {
    const fetcher = new DiffFetcher(this.cid, this.parents, onUpdate)
    fetcher.start()
    return fetcher
  }

  static fetchCommitAndParents(cid, countRequired, onUpdate) {
    const fetcher = new RecursiveCommitFetcher(cid, countRequired, onUpdate)
    fetcher.start()
    return fetcher
  }
}

export default GitCommit
