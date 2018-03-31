import CID from 'cids'
import moment from 'moment'
import Git from './Git'

class GitCommit {
  constructor(data, cid) {
    Object.assign(this, data)
    this.cid = cid

    this.author.moment = moment(this.author.date, 'X ZZ')
    this.committer.moment  = moment(this.author.date, 'X ZZ')

    this.summary = this.message
    if (this.message.length > 80) {
      this.summary = this.message.substring(0, 80) + '...'
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
  fetchChanges(onUpdate) {
    if (!this.parents.length) return

    let stateChanges = []
    const fetchTrees = async (t1, t2) => {
      const trees = await Promise.all([
        Git.fetch(t1),
        Git.fetch(t2)
      ])
      const changes = this.getChanges(...trees)
      changes.forEach(async c => {
        // If the change is a directory, recursively drill down into the directory
        if (c.change[0].isDir() && c.change[1].isDir()) {
          return fetchTrees(c.change[0].cid, c.change[1].cid)
        }

        // Get the contents of the files
        const files = await Promise.all(c.change.map(f => f && f.fetchContents()))

        // As we retrieve the contents for each change, update
        // the state so the diff is rendered, making sure to keep
        // files in lexicographical order
        stateChanges = stateChanges.concat({
          name: c.name,
          change: files
        }).sort((a, b) => {
          if (a.name < b.name) return -1
          if (a.name > b.name) return 1
          return 0
        })
        onUpdate({ changes: stateChanges })
      })
    }
    fetchTrees(`${this.cid}/tree`, `${this.cid}/parents/0/tree`)
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

  static fetchCommitAndParents(cid, total, onUpdate) {
    let count = 0
    const fetched = {}
    let commits = []
    const fetch = (currCid) => {
      // If we've collected enough commits, we're done
      if (count >= total) {
        return
      }

      // If we've already fetched this commit, skip it
      if (fetched[currCid]) {
        return
      }
      fetched[currCid] = true

      // Fetch a commit
      return Git.fetch(currCid).then(async commit => {
        count++

        // Update the list of commits
        commits = commits.concat([commit])
        onUpdate(commits.slice(0, this.rowCount))

        // Fetch the parents of the commit in reverse order
        for (let i = commit.parents.length - 1; i >= 0; i--) {
          await fetch(commit.parents[i].cid)
        }
      })
    }
    fetch(cid)
  }
}

export default GitCommit

