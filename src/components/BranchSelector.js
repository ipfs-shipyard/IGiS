import React, { Component } from 'react'
import ClickOutside from 'react-click-outside'
import Url from '../lib/Url'
import { Link } from 'react-router-dom'

class BranchSelector extends Component {
  constructor(props) {
    super(props)
    this.state = {show: ''}

    this.switchType = this.switchType.bind(this)
    this.toggleSelector = this.toggleSelector.bind(this)
  }

  render() {
    if (!this.props.repo) return null

    return (
      <ClickOutside onClickOutside={this.switchType('')}>
        <div className="BranchSelector">
          <div className="branchButton" onClick={this.toggleSelector}>Branch: <span>{this.props.branch}</span></div>
          {this.renderDropdown()}
        </div>
      </ClickOutside>
    )
  }

  toggleSelector() {
    this.setState({show: this.state.show === '' ? 'heads' : ''})
  }

  switchType(type) {
    return () => this.setState({show: type})
  }

  renderDropdown() {
    if(this.state.show === '') return

    return (
      <div className="branchDropdown bg-white ba">
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
    )
  }

  renderButton(type, name) {
    return <span onClick={this.switchType(type)} className={type !== this.state.show ? 'selectable' : ''}>{name}</span>
  }

  renderOptions(branches) {
    const renderType = (type) => {
      return Object.keys(branches).filter(b => b.startsWith('refs/' + type + '/'))
        .sort((a, b) => this.compareBranches(a, b))
        .map(this.branchNick).map(b =>
        <div key={b}><Link to={Url.toBranch(this.props.repo, b)} onClick={this.switchType('')}>{b}</Link></div>
      )
    }

    switch(this.state.show) {
      case 'heads':
        return renderType('heads')
      case 'tags':
        return renderType('tags')
    }
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
