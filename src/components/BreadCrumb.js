import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Url from '../lib/Url'

class BreadCrumb extends Component {
  render() {
    // Don't show breadcrumbs if there's no file path
    const crumbs = this.props.crumbs
    if ((crumbs || []).length <= 1) {
      return null
    }

    // Shorten cid and don't display too many crumbs
    const abbrev = this.props.crumbs.slice()
    abbrev[0] = abbrev[0].substring(0, 8)
    for (let i = 1; i < abbrev.length && abbrev.join('/').length > 60 && abbrev.filter(c => !!c).length > 3; i++) {
      abbrev[i] = ''
    }

    return (
      <div className="BreadCrumb">{this.renderCrumbs(crumbs, abbrev)}</div>
    )
  }

  renderCrumbs(crumbs, abbrev) {
    return abbrev.map((c, i) => {
      const filePath = [''].concat(crumbs.slice(1, i + 1)).join('/')
      const linkPath = Url.toBranch(this.props.repo, this.props.branch) + filePath
      if (!c) {
        if (i > 1) {
          return null
        }
        c = '…'
      }
      return (
        <div key={i}>
          {i > 0 && <div className="separator">/</div>}
          {i < crumbs.length - 1 && c !== '…' ? (
            <Link to={linkPath} className="crumb">{c}</Link>
          ) : (
            <div className="crumb">{c}</div>
          )}
        </div>
      )
    })
  }
}

export default BreadCrumb
