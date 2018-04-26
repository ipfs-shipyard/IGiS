import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import ZipButton from './ZipButton'

class RepoLinks extends Component {
  render() {
    return (
      <div className="RepoLinks">
        <div className="commits">
          <Link to={`/repo/${this.props.cid}/commits`}>Commits</Link>
          <ZipButton cid={this.props.cid} />
        </div>
      </div>
    );
  }
}

export default RepoLinks
