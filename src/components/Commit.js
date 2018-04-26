import React, { Component } from 'react'
import CommitDiffList from "./CommitDiffList"
import CommitTitle from "./CommitTitle"
import Git from "../lib/git/Git"
import Url from '../lib/Url'

class Commits extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const pathname = this.props.location.pathname

    // If we have not yet fetched the data for the commit, continue with
    // rendering but trigger a fetch in the background (which will
    // call render again on completion)
    this.triggerFetch(pathname)

    return (
      <div className="Commit">
        <CommitTitle commit={this.state.commit} />
        <CommitDiffList changes={this.state.changes} />
      </div>
    )
  }

  async triggerFetch(pathname) {
    if (this.initialized) return
    this.initialized = true

    const url = Url.parseCommitPath(pathname)
    const commit = await Git.fetch(url.commitCid)
    this.setState({ commit })

    commit.fetchDiff(changes => this.setState(changes))
  }
}

export default Commits
