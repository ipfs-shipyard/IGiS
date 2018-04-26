import CID from 'cids'
import { DAGNode } from 'ipld-dag-pb'
import GitCommit from './GitCommit'

const DEFAULT_HEAD_REF = 'refs/heads/master'
const MAX_REFS_DEPTH = 10

class GitRepo {
  constructor(cid, defaultBranch, branches) {
    this.cid = cid
    this.defaultBranch = defaultBranch
    this.branches = branches
  }

  headCommit(branch) {
    const branchPath = branch ? 'refs/heads/' + branch : this.defaultBranch
    return (this.branches || {})[branchPath]
  }

  static branchNick(branchPath) {
    return (branchPath || '').replace('refs/heads/', '')
  }

  static async fetch(cid, onUpdate) {
    const repo = await window.ipfs.dag.get(cid).then(r => r.value)

    const [defaultBranch, branches] = await Promise.all([
      this.getDefaultBranch(repo),
      this.getBranchHeads(repo)
    ])

    onUpdate(new GitRepo(cid, defaultBranch, branches))
  }

  static async getDefaultBranch(repo) {
    const head = repo.links.find(l => l.name === 'HEAD')
    if (!head) return DEFAULT_HEAD_REF

    const headHash = new CID(head.multihash).toBaseEncodedString()
    return window.ipfs.files.cat(headHash).then(h => h.toString())
  }

  static async getBranchHeads(node) {
    const branches = {}
    await this.walkBranchDir(branches, '', node, 1)
    return branches
  }

  static walkBranchDir(branches, path, node, depth) {
    if (depth > MAX_REFS_DEPTH) return

    return Promise.all(node.links.map(async l => {
      const cid = new CID(l.multihash).toBaseEncodedString()
      const obj = await window.ipfs.dag.get(cid).then(r => r.value)
      if (obj instanceof DAGNode) {
        return this.walkBranchDir(branches, path + l.name + '/', obj, depth + 1)
      }
      if(obj.gitType === 'commit') {
        branches[path + l.name] = new GitCommit(obj, cid)
      }
    }))
  }
}

export default GitRepo
