import Async from 'react-promise'
import BranchSelector from "./BranchSelector"
import BreadCrumb from "./BreadCrumb"
import Button from './Button'
import React from 'react'
import LoadingComponent from './LoadingComponent'
import { Link } from 'react-router-dom'
import Url from '../lib/Url'
import ZipButton from './ZipButton'

class RepoLinks extends LoadingComponent {
  constructor(props) {
    super(props)
    this.state = {}
  }

  isDataReady(props, state) {
    return !!props.repo
  }

  Element(props) {
    return (
      <div className="RepoLinks">
        {props.children}
      </div>
    )
  }

  renderContent() {
    function getBranchCompareHref(branch) {
      return Url.toBranchCompare(this.props.repo, this.props.branch, branch)
    }
    const crumbs = [this.props.repo.cid].concat(this.props.url.filePathParts)
    return (
      <this.Element>
        <BranchSelector repo={this.props.repo} branch={this.props.branch} />
        { crumbs.length <= 1 && (
          <span className="compare-selector">
            { this.state.showCompare ? (
              <BranchSelector
                repo={this.props.repo}
                branch={this.props.branch}
                label="Compare"
                getBranchHref={getBranchCompareHref}
                expanded="heads"
                type="heads"
                onClose={() => this.setState({ showCompare: false })} />
            ) : (
              <Button onClick={() => this.setState({ showCompare: true })}>Compare</Button>
            )}
          </span>
        )}
        <BreadCrumb repo={this.props.repo} branch={this.props.branch} crumbs={crumbs} />
        <div className="commits">
          <Link to={`/repo/${this.props.repo.cid}/commits/${encodeURIComponent(this.props.branch)}`}>Commits</Link>
          <Async promise={this.props.repo.refCommit(this.props.branch)} then={ commit =>
            <ZipButton repo={this.props.repo} cid={(commit || {}).cid} />
          } />
        </div>
      </this.Element>
    )
  }

  renderLoading() {
    const crumbs = ((this.props.url || {}).filePathParts || []).length
    const lengths = [6 + Math.random() * 3, crumbs ? crumbs * (10 + Math.random() * 2) : 0, 10]
    return (
      <this.Element>
        <div className="Loading">
          {lengths.map((l, i) => (
            <div className="item" key={i} style={{width: l + 'em'}} />
          ))}
        </div>
      </this.Element>
    )
  }
}

export default RepoLinks
