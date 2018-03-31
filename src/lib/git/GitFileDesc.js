import CID from 'cids'
import Git from './Git'

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
  constructor(data, name) {
    Object.assign(this, data)
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
    return Git.fetch(this.cid)
  }
}

export default GitFileDesc
