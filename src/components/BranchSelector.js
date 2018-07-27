import Async from 'react-promise'
import React, { Component } from 'react'
import Ref from '../lib/git/util/Ref'
import ClickOutside from 'react-click-outside'
import Url from '../lib/Url'
import { Link } from 'react-router-dom'

class BranchSelector extends Component {
  constructor(props) {
    super(props)
    this.state = {show: this.props.expanded || ''}
    this.getBranchHref = this.props.getBranchHref || (b => Url.toBranch(this.props.repo, b))

    this.switchType = this.switchType.bind(this)
    this.toggleSelector = this.toggleSelector.bind(this)
    this.onClickOutside = this.onClickOutside.bind(this)
  }

  render() {
    if (!this.props.repo) return null

    return (
      <div className="BranchSelector-out">
        <ClickOutside onClickOutside={this.onClickOutside}>
          <div className="BranchSelector">
            <div className="branchButton" onClick={this.toggleSelector}>
              {this.props.label || 'Branch'}: <span>{this.props.branch}</span>
            </div>
            {this.renderDropdown()}
          </div>
        </ClickOutside>
      </div>
    )
  }

  toggleSelector() {
    this.setState({show: this.state.show === '' ? 'heads' : ''})
  }

  onClickOutside() {
    this.switchType('')()
    this.props.onClose && this.props.onClose()
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
            {(!this.props.type || this.props.type === 'heads') && this.renderButton('heads', 'Branches')}
            {(!this.props.type || this.props.type === 'tags') && this.renderButton('tags', 'Tags')}
          </div>
        </div>
        <div className="branchList pa1">
          <Async promise={this.props.repo.refs} then={branches => this.renderOptions(branches)} />
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
        .map(Ref.refNick).map(b =>
        <div key={b}><Link to={this.getBranchHref(b)} onClick={this.switchType('')}>{b}</Link></div>
      )
    }

    switch(this.state.show) {
      case 'heads':
        return renderType('heads')
      case 'tags':
        return renderType('tags')
    }
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
