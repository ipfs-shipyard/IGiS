import Async from 'react-promise'
import BranchSelector from "./BranchSelector"
import BreadCrumb from "./BreadCrumb"
import React from 'react'
import LoadingComponent from './LoadingComponent'
import { Link } from 'react-router-dom'
import ZipButton from './ZipButton'

class RepoLinks extends LoadingComponent {
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
    const crumbs = [this.props.repo.cid].concat(this.props.url.filePathParts)
    return (
      <this.Element>
        <BranchSelector repo={this.props.repo} branch={this.props.branch} />
        <BreadCrumb repo={this.props.repo} branch={this.props.branch} crumbs={crumbs} />
        <div className="commits">
          <Async promise={this.props.repo.refCommit(this.props.branch)} then={ commit =>
            <ZipButton repo={this.props.repo} cid={(commit || {}).cid} />
          } />
          <Link to={`/repo/${this.props.repo.cid}/commits/${encodeURIComponent(this.props.branch)}`}>Commits</Link>
        </div>
      </this.Element>
    );
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
