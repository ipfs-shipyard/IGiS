import GitFileDesc from './GitFileDesc'

//
// GitTree describes a tree of files, eg
// {
//   path: '<cid>/my/path'
//   files: [<GitFileDesc>, <GitFileDesc>, ...]
// }
//
class GitTree {
  constructor(repo, data, path) {
    this.path = path
    const files = Object.keys(data).map(name => new GitFileDesc(repo, data[name], name))
    this.files = GitTree.sortFiles(files)
  }

  // Sort directories to the top, followed by files
  static sortFiles(files) {
    return files.sort((a, b) => {
      if (a.isDir()) {
        if (b.isDir()) {
          return a.name > b.name ? 1 : -1
        } else {
          return 1
        }
      } else {
        if (b.isDir()) {
          return 1
        } else {
          return a.name > b.name ? 1 : -1
        }
      }
    })
  }
}

export default GitTree
