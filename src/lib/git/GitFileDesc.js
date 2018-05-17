import CID from 'cids'

//
// GitFileDesc describes a file eg
// {
//   mode: '100644',
//   hash: {
//     '/': <cid>
//   },
//   name: 'myfile.go'
// }
//
class GitFileDesc {
  constructor(repo, data, name) {
    Object.assign(this, data)
    this.repo = repo
    this.name = name
    this.cid = new CID(this.hash['/']).toBaseEncodedString()
  }

  isFile() {
    return this.mode[0] === '1'
  }

  isDir() {
    return this.mode[0] === '4'
  }

  fetchContents() {
    return this.repo.getObject(this.cid)
  }
}

export default GitFileDesc
