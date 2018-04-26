import GitRepo from './git/GitRepo'

class Url {
  static toFile(repo, tree, file) {
    // <cid>/tree/some/hash/path/hash/to/hash/file.go
    const treePathParts = tree.path.split('/')
    const treeCid = treePathParts[0]
    const path = treePathParts.slice(1).filter((p, i) => i % 2 === 1).concat([file.name]).join('/')
    const branchPath = (Object.entries(repo.branches).find(([b, o]) => o.cid === treeCid) || [])[0]
    const branch = GitRepo.branchNick(branchPath)
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
}

export default Url
