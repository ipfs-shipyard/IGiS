import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class RepoLinks extends Component {
  render() {
    return (
      <div className="RepoLinks">
        <div className="commits">
          <Link to={`/repo/${this.props.cid}/commits`}>Commits</Link>
        </div>
      </div>
    );
  }
}

export default RepoLinks