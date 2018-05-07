import CID from 'cids'
import { DAGNode } from 'ipld-dag-pb'
import GitCommit from './GitCommit'
import GitTag from './GitTag'
import GitBlob from './GitBlob'
import GitTree from './GitTree'

const DEFAULT_HEAD_REF = 'refs/heads/master'
const MAX_REFS_DEPTH = 10

class GitRepo {
  constructor(cid, defaultBranch, branches) {
    this.cid = cid
    this.defaultBranch = defaultBranch
    this.branches = branches
  }

  async refCommit(branch) {
    const [ref] = ['heads', 'tags'].filter(b => this.branches['refs/' + b +'/' + branch])
    const branchPath = ref ? 'refs/' + ref + '/' + branch : this.defaultBranch

    return this.branches[branchPath]
  }

  static branchNick(branchPath) {
    return (branchPath || '').replace('refs/heads/', '')
      .replace('refs/tags/', '')
  }

  static async fetch(cid) {
    const repo = await window.ipfs.dag.get(cid).then(r => r.value)

    const [defaultBranch, branches] = await Promise.all([
      this.getDefaultBranch(repo),
      this.getBranchHeads(repo)
    ])

    return new GitRepo(cid, defaultBranch, branches)
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

      branches[path + l.name] = GitRepo.wrapGitObject(obj, cid)
    }))
  }

  static wrapGitObject(obj, cid) {
    if(obj instanceof Blob) {
      return new GitBlob(obj, cid)
    }
    switch (obj.gitType) {
      case 'commit':
        return new GitCommit(obj, cid)
      case 'tag':
        return new GitTag(obj, cid)
      default:
        return new GitTree(obj, cid)
    }
  }
}

export default GitRepo
