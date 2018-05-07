import CID from 'cids'
import GitRepo from './GitRepo'

class GitTag {
  constructor(data, path) {
    Object.assign(this, data)
    this.path = path
  }

  async taggedObject() {
    const objCid = new CID(this.object['/'])
    const obj =  await window.ipfs.dag.get(objCid)
    return GitRepo.wrapGitObject(obj.value, objCid.toBaseEncodedString())
  }
}

export default GitTag
