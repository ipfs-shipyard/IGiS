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

    return (
      <div className="BreadCrumb">{this.renderCrumbs(crumbs)}</div>
    )
  }

  renderCrumbs(crumbs) {
    return crumbs.map((c, i) => {
      const filePath = [''].concat(crumbs.slice(1, i + 1)).join('/')
      const linkPath = Url.toBranch(this.props.repo, this.props.branch) + filePath
      // Shorten cid
      const name = i === 0 ? c.substring(0, 8) : c
      return (
        <div key={i}>
          {i > 0 && <div className="separator">/</div>}
          {i < crumbs.length - 1 ? (
            <Link to={linkPath} className="crumb">{name}</Link>
          ) : (
            <div className="crumb">{name}</div>
          )}
        </div>
      )
    })
  }
}

export default BreadCrumb
