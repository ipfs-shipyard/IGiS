//
// GitBlob describes a blob eg
// {
//   size: 1034,
//   raw: <Buffer>
// }
//
class GitBlob {
  constructor(data, path) {
    this.raw = data
    this.path = path
    this.data = data
    this.parseBlob()
  }

  toString() {
    return this.asString
  }

  parseBlob() {
    if (!this.data instanceof Uint8Array) {
      throw Error(`Could not parse blob with path ${this.path} - data is not a Uint8Array`)
    }
    // The header is 'blob 1234', so getting the first 64 chars should cover it
    const header = this.data.toString('utf8', 0, 64)
    const match = header.match(/^blob ([0-9]+)/)
    if (!match) throw Error(`Could not parse blob with path ${this.path} - bad header ${header || '<empty>'}...`)

    // length + 1 because there is a null byte after the blob length
    this.dataStart = match[0].length + 1
    this.size = parseInt(match[1], 10)
  }

  get content() {
    return this.raw.slice(this.dataStart)
  }

  get asString() {
    return this.data.toString('utf8', this.dataStart)
  }
}

export default GitBlob
