import BranchSelector from "./BranchSelector"
import BreadCrumb from "./BreadCrumb"
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import ZipButton from './ZipButton'

class RepoLinks extends Component {
  render() {
  	if (!this.props.repo) return null

    const crumbs = [this.props.repo.cid].concat(this.props.url.filePathParts)
    return (
      <div className="RepoLinks">
      	<BranchSelector repo={this.props.repo} branch={this.props.branch} />
        <BreadCrumb repo={this.props.repo} branch={this.props.branch} crumbs={crumbs} />
        <div className="commits">
          <ZipButton cid={(this.props.repo.headCommit(this.props.branch) || {}).cid} />
          <Link to={`/repo/${this.props.repo.cid}/commits/${encodeURIComponent(this.props.branch)}`}>Commits</Link>
        </div>
      </div>
    );
  }
}

export default RepoLinks
