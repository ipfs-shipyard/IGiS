import { DAGNode } from 'ipld-dag-pb'
import GitRepo from '../GitRepo'

const MAX_REFS_DEPTH = 10

class Ref {
  static async refCommit(refs, defaultBranch, refNick) {
    const [ref] = ['heads', 'tags'].filter(b => refs[`refs/${b}/${refNick}`])
    const refPath = ref ? `refs/${ref}/${refNick}` : defaultBranch
    return refs[refPath]
  }

  static refNick(refPath) {
    return (refPath || '').replace('refs/heads/', '')
      .replace('refs/tags/', '')
  }

  static async getRefHeads(node) {
    const refs = {}
    await Ref.walkRefDir(refs, '', node, 1)
    return refs
  }

  static walkRefDir(refs, path, node, depth) {
    if (depth > MAX_REFS_DEPTH) return

    return Promise.all(node.links.map(async l => {
      const obj = await window.ipfs.dag.get(l.cid).then(r => r.value)
      if (obj instanceof DAGNode) {
        return Ref.walkRefDir(refs, path + l.name + '/', obj, depth + 1)
      }

      refs[path + l.name] = GitRepo.wrapGitObject(obj, l.cid)
    }))
  }
}

export default Ref
