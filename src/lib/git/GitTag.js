import CID from 'cids'

class GitTag {
  constructor(repo, data, path) {
    Object.assign(this, data)
    this.repo = repo
    this.path = path
  }

  async taggedObject() {
    const objCid = new CID(this.object['/'])
    const obj =  await window.ipfs.dag.get(objCid)
    return this.repo.wrapGitObject(obj.value, objCid.toBaseEncodedString())
  }
}

export default GitTag
