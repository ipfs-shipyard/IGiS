import React, { Component } from 'react';
import Highlight from 'react-highlight'

class FileContent extends Component {
  render() {
    const file = this.props.file
    // TODO: Parse BLOB properly
    const str = file.toString().replace(/^blob [0-9]+/, '')
    let lines = str.toString().split('\n')
    if (lines[lines.length - 1] === '') {
      lines = lines.splice(0, lines.length - 1)
    }
    const ext = (this.props.path.match(/.*\.(.*)/) || [])[1]
    return (
      <div className="FileContent">{this.renderLines(lines, ext)}</div>
    )
  }

  renderLines(lines, ext) {
    const lineNumRows = lines.map((line, i) => (
      <pre key={i} className="line-num">{i+1}</pre>
    ))
    return (
      <table>
        <tbody>
          <tr>
            <td className="line-nums">{lineNumRows}</td>
            <td className="file-code">
              <Highlight className={ext}>{lines.join('\n')}</Highlight>
            </td>
          </tr>
        </tbody>
      </table>
    )
  }
}

export default FileContent
