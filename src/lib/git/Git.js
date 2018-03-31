import GitCommit from './GitCommit'
import GitBlob from './GitBlob'
import GitTree from './GitTree'

class Git {
  static fetch(path) {
    return window.ipfs.dag.get(path).then(res => {
      const data = res.value
      // If this is a Uint8Array treat it as a Git blob
      if (data instanceof Uint8Array) {
        return new GitBlob(data, path)
      }
      // If it has a gitType commit treat it as a commit
      if (data.gitType === 'commit') {
        return new GitCommit(data, path)
      }
      // Otherwise assume git tree
      return new GitTree(data, path)
    })
  }
}

export default Git
