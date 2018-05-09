import React, { Component } from 'react'
import Url from '../lib/Url'

class BranchSelector extends Component {
  constructor(props) {
    super(props)
    this.state = {show: ''}

    this.switchType = this.switchType.bind(this)
  }

  switchType(type) {
    return () => this.setState({show: type})
  }

  render() {
    if (!this.props.repo) return null

    return (
      <div className="BranchSelector">
        <div>Branch: <span className="branch" onClick={this.switchType('heads')}>{this.props.branch}</span></div>
        {this.renderDropdown()}
      </div>
    )
  }

  renderDropdown() {
    if(this.state.show === '') return

    return <div className="branchDropdown bg-white ba">
      <div>
        <div className="bb pa1 refType">
          {this.renderButton('heads', 'Branches')}
          {this.renderButton('tags', 'Tags')}
        </div>
      </div>
      <div className="branchList pa1">
        {this.renderOptions(this.props.repo.branches)}
      </div>
    </div>
  }

  renderButton(type, name) {
    return <span onClick={this.switchType(type)} className={type !== this.state.show ? 'selectable' : ''}>{name}</span>
  }

  renderOptions(branches) {
    const renderType = (type) => {
      return Object.keys(branches).filter(b => b.startsWith('refs/' + type + '/'))
        .sort((a, b) => this.compareBranches(a, b))
        .map(this.branchNick).map(b =>
        <div><a href="#" onClick={this.handleChange(b)}>{b}</a></div>
      )
    }

    switch(this.state.show) {
      case 'heads':
        return renderType('heads')
      case 'tags':
        return renderType('tags')
    }
  }

  handleChange(event, to) {
    return () => window.location.href = '#' + Url.toBranch(this.props.repo, to)
  }

  branchNick(branch) {
    return branch.replace('refs/heads/', '')
      .replace('refs/tags/', '')
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
