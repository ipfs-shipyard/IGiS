import React from 'react'
import LoadingComponent from './LoadingComponent'
import CommitDiffFile from './CommitDiffFile'

class CommitDiffList extends LoadingComponent {
  isDataReady(props, state) {
    return !!(props.changes || []).length
  }

  render() {
    if (!this.isDataReady(this.props, this.state) || this.allChanges) {
      return super.render()
    }

    // Each change object contains a change promise that will
    // return the results of fetching the contents of the two
    // files to be compared.
    // Wait till all of the contents of all the changes have been
    // fetched then render them all at the same time so the page
    // doesn't jump around.
    this.allChanges = this.props.changes.map(c => c.change)
    Promise.all(this.allChanges).then(allResults => {
      const completedChanges = this.props.changes.map((c, i) => Object.assign(c, { files: allResults[i] }))
      this.setState({ completedChanges })
    })
    return super.render()
  }

  Element(props) {
    return (
      <div className="CommitDiffList">
        {props.children}
      </div>
    )
  }

  renderContent() {
    return (
      <this.Element>
        {this.renderFiles(this.props.completedChanges || this.props.changes)}
      </this.Element>
    )
  }

  renderFiles(changes) {
    return changes.map(c => (
      <CommitDiffFile key={c.path} change={c} />
    ))
  }

  renderLoading() {
    this.loadingLengths = this.loadingLengths || [...Array(Math.floor(10 + Math.random() * 5))].map(() => [
      10 + Math.random() * 40
    ])
    return (
      <this.Element>
        <div className="Loading">
          {this.loadingLengths.map((l, i) => (
            <div className="item" key={i} style={{width: l + 'em'}} />
          ))}
        </div>
      </this.Element>
    )
  }
}

export default CommitDiffList
