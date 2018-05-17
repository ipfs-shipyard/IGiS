import React, { Component } from 'react'
import JSZip from 'jszip'
import GitTree from "../lib/git/GitTree";
import GitBlob from "../lib/git/GitBlob";
import FileSaver from "file-saver";

class ZipButton extends Component {
  constructor(props) {
    super(props)
    this.state = {processing: false};

    this.handleClick = this.handleClick.bind(this);
    this.populateTree = this.populateTree.bind(this);
  }

  handleClick(e) {
    e.preventDefault()
    this.setState({processing: true, current: 'preparing'})

    let zip = new JSZip()
    this.populateTree(zip, this.props.cid + '/tree', '').then(() => {
    this.setState({processing: true, current: 'finalizing'})
      zip.generateAsync({type: 'blob'})
        .then(content => {
          this.setState({processing: false})
          FileSaver.saveAs(content, 'repository.zip')
        })
    })
  }

  async populateTree(zipDir, path, name) {
    this.setState({processing: true, current: path})
    let data = await this.props.repo.getObject(path)
    if (data instanceof GitBlob) {
      zipDir.file(name, data.content, {base64: true});
    } else if (data instanceof GitTree) {
      let promises = data.files.map(async d => {
        let child = zipDir
        if(name !== '') {
          child = zipDir.folder(name)
        }
        await this.populateTree(child, path + '/' + d.name + '/hash', d.name)
      })

      await Promise.all(promises)
    }
  }

  render() {
    if (!this.props.cid) return null
    
    return (
      <span className="ZipButton">
        { this.state.processing ? (
          <span>Zip: processing {this.state.current}</span>
        ) : (
          <a href='#' onClick={this.handleClick}>Download Zip</a>
        )}
      </span>
    )
  }
}

export default ZipButton
