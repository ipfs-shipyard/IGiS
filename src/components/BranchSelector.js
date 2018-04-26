import React, { Component } from 'react'
import Url from '../lib/Url'

class BranchSelector extends Component {
  render() {
    if (!this.props.repo) return null

    return (
      <div className="BranchSelector">
        <div className="title">Branch:</div>
      	<select onChange={e => this.handleChange(e)} value={this.props.branch}>
          {this.renderOptions(this.props.repo.branches)}
        </select>
      </div>
    )
  }

  renderOptions(branches) {
    return Object.keys(branches).sort((a, b) => this.compareBranches(a, b)).map(this.branchNick).map(b =>
      <option key={b} value={b}>{b}</option>
    )
  }

  handleChange(event) {
    window.location.href = '#' + Url.toBranch(this.props.repo, event.target.value)
  }

  branchNick(branch) {
    return branch.replace('refs/heads/', '')
  }

  compareBranches(a, b) {
    // Make sure default branch is at the top (eg master)
    if (a === this.props.repo.defaultBranch) return -1
    if (b === this.props.repo.defaultBranch) return 1

    if (a < b) return -1
    if (a > b) return 1

    return 0
  }
}

export default BranchSelector
