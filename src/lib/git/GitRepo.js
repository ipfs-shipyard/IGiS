import CID from 'cids'
import { DAGNode } from 'ipld-dag-pb'
import GitCommit from './GitCommit'
import GitTag from './GitTag'
import GitBlob from './GitBlob'
import GitTree from './GitTree'

const DEFAULT_HEAD_REF = 'refs/heads/master'
const MAX_REFS_DEPTH = 10

//TODO: cleanup
class GitRepo {
  constructor(cid, headObj, defaultBranch) {
    this.cid = cid
    this.defaultBranch = defaultBranch

    this.branches = this.getBranchHeads(headObj)
  }

  async refCommit(branch) {
    const branches = await this.branches
    const [ref] = ['heads', 'tags'].filter(b => branches['refs/' + b +'/' + branch])
    const branchPath = ref ? 'refs/' + ref + '/' + branch : this.defaultBranch

    return branches[branchPath]
  }

  async getObject(path) {
    const data = (await window.ipfs.dag.get(path)).value
    // If this is a Uint8Array treat it as a Git blob
    if (data instanceof Uint8Array) {
      return new GitBlob(data, path)
    }
    // If it has a gitType commit treat it as a commit
    if (data.gitType === 'commit') {
      return new GitCommit(this, data, path)
    }
    // If it has a gitType commit treat it as a tag
    if (data.gitType === 'tag') {
      return new GitTag(this, data, path)
    }
    // Otherwise assume git tree
    return new GitTree(this, data, path)
  }

  static branchNick(branchPath) {
    return (branchPath || '').replace('refs/heads/', '')
      .replace('refs/tags/', '')
  }

  static async fetch(cid) {
    const repo = await window.ipfs.dag.get(cid).then(r => r.value)

    const defaultBranch = await this.getDefaultBranch(repo)

    return new GitRepo(cid, repo, defaultBranch)
  }

  static async getDefaultBranch(repo) {
    const head = repo.links.find(l => l.name === 'HEAD')
    if (!head) return DEFAULT_HEAD_REF

    const headHash = new CID(head.multihash).toBaseEncodedString()
    return window.ipfs.files.cat(headHash).then(h => h.toString())
  }

  async getBranchHeads(node) {
    const branches = {}
    await this.walkBranchDir(branches, '', node, 1)
    return branches
  }

  walkBranchDir(branches, path, node, depth) {
    if (depth > MAX_REFS_DEPTH) return

    return Promise.all(node.links.map(async l => {
      const cid = new CID(l.multihash).toBaseEncodedString()
      const obj = await window.ipfs.dag.get(cid).then(r => r.value)
      if (obj instanceof DAGNode) {
        return this.walkBranchDir(branches, path + l.name + '/', obj, depth + 1)
      }

      branches[path + l.name] = this.wrapGitObject(obj, cid)
    }))
  }

  wrapGitObject(obj, cid) {
    if(obj instanceof Blob) {
      return new GitBlob(obj, cid)
    }
    switch (obj.gitType) {
      case 'commit':
        return new GitCommit(this, obj, cid)
      case 'tag':
        return new GitTag(this, obj, cid)
      default:
        return new GitTree(this, obj, cid)
    }
  }
}

export default GitRepo
