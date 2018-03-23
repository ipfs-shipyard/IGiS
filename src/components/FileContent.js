import React, { Component } from 'react';

class FileContent extends Component {
  render() {
    const file = this.props.file
    // TODO: Parse BLOB properly
    const lines = file.toString().split('\n')
    lines.shift()
    return (
      <div className="FileContent">{this.renderLines(lines)}</div>
    )
  }

  renderLines(lines) {
    const lineRows = lines.map((line, i) => (
      <tr key={i} className="line">
        <td className="line-num">{i+1}</td>
        <td className="line-text">{line}</td>
      </tr>
    ))
    return (
      <table className="lines"><tbody>{lineRows}</tbody></table>
    )
  }
}

export default FileContent
