import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class BreadCrumb extends Component {
  render() {
    // Don't show breadcrumbs if it's just /repo/<cid>
    const crumbs = this.props.crumbs
    if ((crumbs || []).length < 2) {
      return null
    }

    return (
      <div className="BreadCrumb">{this.renderCrumbs(crumbs)}</div>
    )
  }

  renderCrumbs(crumbs) {
    return crumbs.map((c, i) => {
      const linkPath = this.props.path + '/' + crumbs.slice(0, i + 1).join('/')
      // Shorten cid
      const name = i === 0 ? c.substring(0, 8) : c
      return (
        <div key={i}>
          {i > 0 && <div className="separator">/</div>}
          {i < crumbs.length -1 ? (
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
