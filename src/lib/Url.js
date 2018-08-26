import Ref from './git/util/Ref'

class Url {
  static async toFile(repo, tree, file) {
    // <cid>/tree/some/hash/path/hash/to/hash/file.go
    const treePathParts = tree.path.split('/')
    const treeCid = treePathParts[0]
    const path = treePathParts.slice(1).filter((p, i) => i % 2 === 1).concat([file.name]).join('/')
    const branchPath = (Object.entries(await repo.refs).find(([b, o]) => o.cid === treeCid) || [])[0]
    const branch = Ref.refNick(branchPath)
    const type = file.isDir() ? 'tree' : 'blob'
    return `/repo/${repo.cid}/${type}/${encodeURIComponent(branch)}/${path}`
  }

  static toBranch(repo, branch) {
    return `/repo/${repo.cid}/tree/${encodeURIComponent(branch)}`
  }

  static parseRepoPath(url) {
    // /repo/<cid>/blob/<branch>/some/path.ext
    const parts = url.split('/')
    if (parts[1] !== 'repo') return {}

    return {
      parts: parts,
      repoCid: parts[2],
      gitType: parts[3],
      branch: parts[4] && decodeURIComponent(parts[4]),
      basePath: parts.slice(0, 5).join('/'),
      filePath: parts.slice(5).join('/') || undefined,
      filePathParts: parts.slice(5)
    }
  }

  static toCommitsPath(repoCid, branch) {
    return `/repo/${repoCid}/commits/${encodeURIComponent(branch)}`
  }

  static parseCommitsPath(url) {
    // /repo/<cid>/commits/<branch>/<commit cid>
    const parts = url.split('/')
    if (parts[1] !== 'repo') return {}

    return {
      parts: parts,
      repoCid: parts[2],
      branch: parts[4] && decodeURIComponent(parts[4]),
      commitCid: parts[5],
      basePath: parts.slice(0, 5).join('/')
    }
  }

  static parseCommitPath(url) {
    // /repo/<cid>/commit/<commit cid>
    const parts = url.split('/')
    if (parts[1] !== 'repo') return {}

    return {
      parts: parts,
      repoCid: parts[2],
      commitCid: parts[4]
    }
  }

  static toBranchCompare(repo, base, compare) {
    return `/repo/${repo.cid}/compare/${encodeURIComponent(base)}...${encodeURIComponent(compare)}`
  }

  static parseComparePath(url) {
    // /repo/<cid>/compare/<branch>...<branch>
    const parts = url.split('/')
    if (parts[1] !== 'repo') return {}

    const branches = (parts[4] || '').split('...')
    if (branches.length !== 2) return {}

    return {
      parts: parts,
      repoCid: parts[2],
      branches: branches.map(decodeURIComponent)
    }
  }
}

export default Url
