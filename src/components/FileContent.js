import React from 'react'
import LoadingComponent from './LoadingComponent'
import Highlight from 'react-highlight'

class FileContent extends LoadingComponent {
  isDataReady(props, state) {
    return !!this.props.content
  }

  Element(props) {
    return (
      <div className="FileContent">
        {props.children}
      </div>
    )
  }

  renderContent() {
    let lines = this.props.content.toString().split('\n')
    if (lines[lines.length - 1] === '') {
      lines = lines.splice(0, lines.length - 1)
    }
    const ext = (this.props.path.match(/.*\.(.*)/) || [])[1]
    return (
      <this.Element>{this.renderLines(lines, ext)}</this.Element>
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

  renderLoading() {
    const lengths = [...Array(Math.floor(15 + Math.random() * 10))].map(() => 10 + Math.random() * 50)
    return (
      <this.Element>
        <div className="Loading">
          {lengths.map((l, i) => (
            <div className="item" key={i}>
              <div className="line-num"></div>
              <div className="file-content" style={{width: l + 'em'}}></div>
            </div>
          ))}
        </div>
      </this.Element>
    )
  }
}

export default FileContent
